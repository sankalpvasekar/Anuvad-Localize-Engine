import re

def test_regex():
    text = "आज आपण TECH - 40 कडे पाहत आहोत."
    marker_pattern = re.compile(
        r'(?:MATH|मॅथ|मैथ|टेक|टेक्|TECH|TECHNOLOGY)\s*[:\-\s_]*\s*([0-9०१२३४५६७८९]{1,3})', 
        re.IGNORECASE
    )
    matches = list(marker_pattern.finditer(text))
    print(f"Matches found: {len(matches)}")
    for m in matches:
        print(f"Match: '{m.group(0)}' at {m.start()}:{m.end()}")
    
    mapping = {"TECH_0": "integration"}
    placeholders = list(mapping.keys())
    
    unmasked = text
    for i in range(min(len(matches), len(placeholders)) - 1, -1, -1):
        match = matches[i]
        placeholder = placeholders[i]
        unmasked = unmasked[:match.start()] + placeholder + unmasked[match.end():]
        
    print(f"Intermediate: {unmasked}")
    for p, o in mapping.items():
        unmasked = unmasked.replace(p, o)
    print(f"Final: {unmasked}")

if __name__ == "__main__":
    test_regex()
