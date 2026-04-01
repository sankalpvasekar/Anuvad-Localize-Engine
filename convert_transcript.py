import json
import re

def parse_transcript(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]
        
    segments = []
    i = 0
    while i < len(lines):
        # Look for a timestamp (e.g., 0:01 or 12:34)
        if re.match(r'^\d+:\d+$', lines[i]):
            start_str = lines[i]
            
            # The next line is likely the text
            text = ""
            if i + 1 < len(lines) and not re.match(r'^\d+:\d+$', lines[i+1]):
                text = lines[i+1]
                
                # The line after that is the next timestamp (or end of file)
                end_str = None
                if i + 2 < len(lines) and re.match(r'^\d+:\d+$', lines[i+2]):
                    end_str = lines[i+2]
                elif i + 2 >= len(lines):
                    # End of file, use a dummy end or same as start
                    end_str = start_str
                
                if end_str:
                    segments.append({
                        "start_str": start_str,
                        "end_str": end_str,
                        "text": text
                    })
            i += 1
        else:
            i += 1
            
    # Convert timestamps to floats for the API
    def to_seconds(t_str):
        parts = t_str.split(':')
        return int(parts[0]) * 60 + int(parts[1])
        
    final_segments = []
    for seg in segments:
        final_segments.append({
            "start": float(to_seconds(seg["start_str"])),
            "end": float(to_seconds(seg["end_str"])),
            "text": seg["text"]
        })
        
    return final_segments

if __name__ == "__main__":
    segments = parse_transcript('transcript.txt')
    with open('segments.json', 'w', encoding='utf-8') as f:
        json.dump(segments, f, indent=2)
    print(f"Successfully converted transcript.txt into {len(segments)} JSON segments.")
