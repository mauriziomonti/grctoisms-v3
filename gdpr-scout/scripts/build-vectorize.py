"""
GDPR Vectorize Pipeline
=======================
Fetches the full GDPR text from EUR-Lex, chunks it by article,
generates embeddings via Cloudflare AI, and uploads to Vectorize.

Usage:
    python scripts/build-vectorize.py \
        --account-id YOUR_ACCOUNT_ID \
        --api-token YOUR_API_TOKEN \
        --index-name gdpr-documents

Requirements:
    pip install requests
"""

import re
import json
import time
import argparse
import requests

GDPR_URL = "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32016R0679"
CF_BASE = "https://api.cloudflare.com/client/v4"
EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5"  # 768 dimensions, free on Cloudflare AI
BATCH_SIZE = 25  # Vectorize upsert batch size


def fetch_gdpr_text() -> str:
    """Fetch raw GDPR text from EUR-Lex."""
    print("Fetching GDPR text from EUR-Lex...")
    resp = requests.get(GDPR_URL, timeout=30)
    resp.raise_for_status()
    return resp.text


def parse_articles(html: str) -> list[dict]:
    """Extract individual articles from the GDPR HTML."""
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', ' ', html)
    clean = re.sub(r'\s+', ' ', clean)

    # Split on Article boundaries
    pattern = r'(Article\s+(\d+)\s*[:\-–]?\s*([^\n]{5,80}))'
    chunks = []

    # Find all article positions
    matches = list(re.finditer(r'Article\s+(\d+)', clean))

    for i, match in enumerate(matches):
        art_num = int(match.group(1))
        if art_num > 99:
            continue

        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(clean)
        text = clean[start:end].strip()

        # Extract title (first line after "Article N")
        lines = text.split('.')
        title = lines[0].replace(f'Article {art_num}', '').strip()
        title = title.lstrip(' :-–').strip()[:100]

        # Keep chunks under ~1500 chars for embedding quality
        if len(text) > 1500:
            # Split into sub-chunks by paragraph
            paragraphs = text.split('  ')
            current = ''
            sub_idx = 0
            for para in paragraphs:
                if len(current) + len(para) > 1400:
                    if current:
                        chunks.append({
                            'id': f'gdpr-art{art_num}-{sub_idx}',
                            'article': f'Article {art_num}',
                            'title': title,
                            'text': current.strip(),
                            'sub_chunk': sub_idx
                        })
                        sub_idx += 1
                    current = para
                else:
                    current += ' ' + para
            if current:
                chunks.append({
                    'id': f'gdpr-art{art_num}-{sub_idx}',
                    'article': f'Article {art_num}',
                    'title': title,
                    'text': current.strip(),
                    'sub_chunk': sub_idx
                })
        else:
            chunks.append({
                'id': f'gdpr-art{art_num}-0',
                'article': f'Article {art_num}',
                'title': title,
                'text': text[:1500],
                'sub_chunk': 0
            })

    print(f"Parsed {len(chunks)} chunks from {len(set(c['article'] for c in chunks))} articles")
    return chunks


def generate_embedding(text: str, account_id: str, api_token: str) -> list[float]:
    """Generate embedding using Cloudflare Workers AI."""
    url = f"{CF_BASE}/accounts/{account_id}/ai/run/{EMBEDDING_MODEL}"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, headers=headers, json={"text": text}, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return data["result"]["data"][0]


def upsert_vectors(vectors: list[dict], index_name: str, account_id: str, api_token: str):
    """Upload a batch of vectors to Cloudflare Vectorize."""
    url = f"{CF_BASE}/accounts/{account_id}/vectorize/v2/indexes/{index_name}/upsert"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/x-ndjson"
    }
    # Vectorize expects NDJSON format
    ndjson = "\n".join(json.dumps(v) for v in vectors)
    resp = requests.post(url, headers=headers, data=ndjson, timeout=60)
    resp.raise_for_status()
    return resp.json()


def main():
    parser = argparse.ArgumentParser(description="Build GDPR Vectorize index")
    parser.add_argument("--account-id", required=True, help="Cloudflare account ID")
    parser.add_argument("--api-token", required=True, help="Cloudflare API token")
    parser.add_argument("--index-name", default="gdpr-documents", help="Vectorize index name")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no upload")
    args = parser.parse_args()

    # 1. Fetch GDPR text
    html = fetch_gdpr_text()

    # 2. Parse into chunks
    chunks = parse_articles(html)

    # Save chunks to file for inspection
    with open("gdpr-scout/data/gdpr/chunks.json", "w") as f:
        json.dump(chunks, f, indent=2)
    print(f"Chunks saved to gdpr-scout/data/gdpr/chunks.json")

    if args.dry_run:
        print("Dry run complete — no vectors uploaded")
        return

    # 3. Generate embeddings and upload in batches
    vectors_batch = []
    total = len(chunks)

    for i, chunk in enumerate(chunks):
        print(f"[{i+1}/{total}] Embedding {chunk['id']}...")

        embedding = generate_embedding(chunk['text'], args.account_id, args.api_token)

        vectors_batch.append({
            "id": chunk['id'],
            "values": embedding,
            "metadata": {
                "article": chunk['article'],
                "title": chunk['title'],
                "text": chunk['text'][:512],  # Vectorize metadata limit
                "source": "GDPR EU 2016/679"
            }
        })

        # Upload in batches
        if len(vectors_batch) >= BATCH_SIZE or i == total - 1:
            print(f"  Uploading batch of {len(vectors_batch)} vectors...")
            result = upsert_vectors(vectors_batch, args.index_name, args.account_id, args.api_token)
            print(f"  Uploaded: {result}")
            vectors_batch = []
            time.sleep(0.5)  # Rate limit buffer

    print(f"\nDone. {total} chunks embedded and uploaded to '{args.index_name}'")


if __name__ == "__main__":
    main()
