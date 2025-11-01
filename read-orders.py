import os
import glob

# Find the orders page file
patterns = [
    'src/app/[locale]/account/orders/[id]/page.tsx',
    'src/app/*/account/orders/*/page.tsx',
]

for pattern in patterns:
    files = glob.glob(pattern)
    for f in files:
        if 'orders' in f and f.endswith('.tsx'):
            print(f"Found: {f}")
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    content = file.read()
                    print("=" * 80)
                    print(content)
            except Exception as e:
                print(f"Error reading {f}: {e}")
