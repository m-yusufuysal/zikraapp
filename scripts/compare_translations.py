import json
import os

def get_keys(d, parent_key=''):
    keys = set()
    for k, v in d.items():
        new_key = f"{parent_key}.{k}" if parent_key else k
        if isinstance(v, dict):
            keys.update(get_keys(v, new_key))
        else:
            keys.add(new_key)
    return keys

def compare_translations():
    base_path = '/Users/yusufsmacbook/Desktop/Islamvy/islamvy-app/src/i18n/locales/'
    tr_file = os.path.join(base_path, 'tr.json')
    others = ['en.json', 'ar.json', 'id.json', 'fr.json']
    
    with open(tr_file, 'r', encoding='utf-8') as f:
        tr_data = json.load(f)
        tr_keys_map = {k: v for k, v in get_keys_with_values(tr_data)}
        tr_keys = set(tr_keys_map.keys())
        
    results = {}
    for other in others:
        other_path = os.path.join(base_path, other)
        with open(other_path, 'r', encoding='utf-8') as f:
            other_data = json.load(f)
            other_keys_map = {k: v for k, v in get_keys_with_values(other_data)}
            other_keys = set(other_keys_map.keys())
            
        missing = tr_keys - other_keys
        extra = other_keys - tr_keys
        
        untranslated = []
        for key in (tr_keys & other_keys):
            # Ignore keys that are naturally the same across languages (e.g. "OK", numbers, or brands)
            val_tr = str(tr_keys_map[key])
            val_other = str(other_keys_map[key])
            if val_tr == val_other and len(val_tr) > 2 and not val_tr.isdigit() and key not in ['common.ok', 'common.yes', 'common.no']:
                untranslated.append(key)
        
        results[other] = {
            'missing': sorted(list(missing)),
            'potentially_untranslated': sorted(untranslated),
            'extra': sorted(list(extra))
        }
        
    print(json.dumps(results, indent=4, ensure_ascii=False))

def get_keys_with_values(d, parent_key=''):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}.{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(get_keys_with_values(v, new_key))
        elif isinstance(v, list):
            # For lists like FAQs, we just track the keys for now or expand them
            for idx, item in enumerate(v):
                if isinstance(item, dict):
                    items.extend(get_keys_with_values(item, f"{new_key}.{idx}"))
                else:
                    items.append((new_key, v))
        else:
            items.append((parent_key, {k: v}))
    # Flatten items to (key, value) pairs
    final_items = []
    def flatten(d, pk=''):
        for k, v in d.items():
            nk = f"{pk}.{k}" if pk else k
            if isinstance(v, dict):
                flatten(v, nk)
            else:
                final_items.append((nk, v))
    
    # Redo get_keys_with_values properly
    return final_items_refined(d)

def final_items_refined(d, parent_key=''):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}.{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(final_items_refined(v, new_key))
        elif isinstance(v, list):
            for idx, item in enumerate(v):
                if isinstance(item, dict):
                    items.extend(final_items_refined(item, f"{new_key}.{idx}"))
                else:
                    items.append((f"{new_key}.{idx}", item))
        else:
            items.append((new_key, v))
    return items

if __name__ == "__main__":
    compare_translations()
