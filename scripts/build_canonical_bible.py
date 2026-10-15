import json
import sqlite3
import os
import re
import unicodedata

print("Initializing Enhanced Canonical Bible Builder...")

# 1. Load Portuguese ARA
with open("/tmp/pt_ara.json", "r", encoding="utf-8") as f:
    pt_books = json.load(f)
pt_map = {b["abbrev"]: b["chapters"] for b in pt_books}

# 2. Load Hebrew Bible
with open("/tmp/hebrew_bible.json", "r", encoding="utf-8") as f:
    he_books = json.load(f)

# 3. Load Lexicon
with open("/tmp/lexicon.json", "r", encoding="utf-8") as f:
    lex_data = json.load(f)

# 4. Load Verse Strongs SQLite
conn = sqlite3.connect("/tmp/verse-strongs.sqlite")
cursor = conn.cursor()

def get_verse_strongs(ref_code):
    cursor.execute("SELECT strongs FROM verse_strongs WHERE reference = ?", (ref_code,))
    row = cursor.fetchone()
    if row and row[0]:
        return [s.strip() for s in row[0].split(",") if s.strip()]
    return []

# 5. Book abbreviation mappings
PT_ABBR = {
    "GEN": "gn", "EXO": "ex", "LEV": "lv", "NUM": "nm", "DEU": "dt",
    "JOS": "js", "JDG": "jz", "RUT": "rt", "1SA": "1sm", "2SA": "2sm",
    "1KI": "1rs", "2KI": "2rs", "1CH": "1cr", "2CH": "2cr", "EZR": "ed",
    "NEH": "ne", "EST": "et", "JOB": "jó", "PSA": "sl", "PRO": "pv",
    "ECC": "ec", "SNG": "ct", "ISA": "is", "JER": "jr", "LAM": "lm",
    "EZK": "ez", "DAN": "dn", "HOS": "os", "JOL": "jl", "AMO": "am",
    "OBA": "ob", "JON": "jn", "MIC": "mq", "NAM": "na", "HAB": "hc",
    "ZEP": "sf", "HAG": "ag", "ZEC": "zc", "MAL": "ml",
    "MAT": "mt", "MRK": "mc", "LUK": "lc", "JHN": "jo", "ACT": "atos",
    "ROM": "rm", "1CO": "1co", "2CO": "2co", "GAL": "gl", "EPH": "ef",
    "PHP": "fp", "COL": "cl", "1TH": "1ts", "2TH": "2ts", "1TI": "1tm",
    "2TI": "2tm", "TIT": "tt", "PHM": "fm", "HEB": "hb", "JAS": "tg",
    "1PE": "1pe", "2PE": "2pe", "1JN": "1jo", "2JN": "2jo", "3JN": "3jo",
    "JUD": "jd", "REV": "ap"
}

HE_KEY = {
    "GEN": "Gen", "EXO": "Exod", "LEV": "Lev", "NUM": "Num", "DEU": "Deut",
    "JOS": "Josh", "JDG": "Judg", "RUT": "Ruth", "1SA": "1Sam", "2SA": "2Sam",
    "1KI": "1Kgs", "2KI": "2Kgs", "1CH": "1Chr", "2CH": "2Chr", "EZR": "Ezra",
    "NEH": "Neh", "EST": "Esth", "JOB": "Job", "PSA": "Ps", "PRO": "Prov",
    "ECC": "Eccl", "SNG": "Song", "ISA": "Isa", "JER": "Jer", "LAM": "Lam",
    "EZK": "Ezek", "DAN": "Dan", "HOS": "Hos", "JOL": "Joel", "AMO": "Amos",
    "OBA": "Obad", "JON": "Jonah", "MIC": "Mic", "NAM": "Nah", "HAB": "Hab",
    "ZEP": "Zeph", "HAG": "Hag", "ZEC": "Zech", "MAL": "Mal"
}

SBLGNT_FILES = {
    "MAT": "61-Mt-morphgnt.txt", "MRK": "62-Mk-morphgnt.txt", "LUK": "63-Lk-morphgnt.txt",
    "JHN": "64-Jn-morphgnt.txt", "ACT": "65-Ac-morphgnt.txt", "ROM": "66-Ro-morphgnt.txt",
    "1CO": "67-1Co-morphgnt.txt", "2CO": "68-2Co-morphgnt.txt", "GAL": "69-Ga-morphgnt.txt",
    "EPH": "70-Eph-morphgnt.txt", "PHP": "71-Php-morphgnt.txt", "COL": "72-Col-morphgnt.txt",
    "1TH": "73-1Th-morphgnt.txt", "2TH": "74-2Th-morphgnt.txt", "1TI": "75-1Ti-morphgnt.txt",
    "2TI": "76-2Ti-morphgnt.txt", "TIT": "77-Tit-morphgnt.txt", "PHM": "78-Phm-morphgnt.txt",
    "HEB": "79-Heb-morphgnt.txt", "JAS": "80-Jas-morphgnt.txt", "1PE": "81-1Pe-morphgnt.txt",
    "2PE": "82-2Pe-morphgnt.txt", "1JN": "83-1Jn-morphgnt.txt", "2JN": "84-2Jn-morphgnt.txt",
    "3JN": "85-3Jn-morphgnt.txt", "JUD": "86-Jud-morphgnt.txt", "REV": "87-Re-morphgnt.txt"
}

# Clean Kethiv/Qere variant concatenation from OSIS conversion
def clean_kethiv_qere(w):
    if len(w) < 12:
        return w
    m = re.search(r"^([\u05D0-\u05EA]{2,})\1([\u05D0-\u05EA\u0590-\u05CF]+)$", w)
    if m:
        return m.group(2)
    return w

# Clean Decalogue Hebrew texts
EXO_20_CLEAN = {
    2: ["אָֽנֹכִ֖י", "יְהוָ֣ה", "אֱלֹהֶ֑יךָ", "אֲשֶׁ֧ר", "הוֹצֵאתִ֛יךָ", "מֵאֶ֥רֶץ", "מִצְרַ֖יִם", "מִבֵּ֣ית", "עֲבָדִֽים׃"],
    3: ["לֹ֣א", "יִהְיֶֽה־לְךָ֛", "אֱלֹהִ֥ים", "אֲחֵרִ֖ים", "עַל־פָּנָֽיַ׃"],
    4: ["לֹ֣א", "תַֽעֲשֶׂ֨ה־לְךָ֥", "פֶ֣סֶל֙", "וְכָל־תְּמוּנָ֔ה", "אֲשֶׁ֤ר", "בַּשָּׁמַ֨יִם֙", "מִמַּ֔עַל", "וַאֲשֶׁ֥ר", "בָּאָ֖רֶץ", "מִתָּ֑חַת", "וַאֲשֶׁ֥ר", "בַּמַּ֖יִם", "מִתַּ֥חַת", "לָאָֽרֶץ׃"],
    5: ["לֹֽא־תִשְׁתַּחֲוֶ֥ה", "לָהֶ֖ם", "וְלֹ֣א", "תָעָבְדֵ֑ם", "כִּ֣י", "אָֽנֹכִ֞י", "יְהוָ֤ה", "אֱלֹהֶ֨יךָ֙", "אֵ֣ל", "קַנָּ֔א", "פֹּ֠קֵד", "עֲו‍ֹ֨ן", "אָבֹ֧ת", "עַל־בָּנִ֛ים", "עַל־שִׁלֵּשִׁ֥ים", "וְעַל־רִבֵּעִ֖ים", "לְשֹׂנְאָֽי׃"],
    6: ["וְעֹ֥שֶׂה", "חֶ֖סֶד", "לַאֲלָפִ֑ים", "לְאֹהֲבַ֖י", "וּלְשֹׁמְרֵ֥י", "מִצְו‍ֹתָֽי׃"],
    7: ["לֹ֥א", "תִשָּׂ֛א", "אֶת־שֵֽׁם־יְהוָ֥ה", "אֱלֹהֶ֖יךָ", "לַשָּׁ֑וְא", "כִּ֣י", "לֹ֤א", "יְנַקֶּה֙", "יְהוָ֔ה", "אֵ֛ת", "אֲשֶׁר־יִשָּׂ֥א", "אֶת־שְׁמ֖וֹ", "לַשָּֽׁוְא׃"],
    8: ["זָכ֛וֹר", "אֶת־י֥וֹם", "הַשַּׁבָּ֖ת", "לְקַדְּשֽׁוֹ׃"],
    9: ["שֵׁ֤שֶׁת", "יָמִים֙", "תַּֽעֲבֹ֔ד", "וְעָשִׂ֖יתָ", "כָּל־מְלַאכְתֶּֽךָ׃"],
    10: ["וְי֨וֹם֙", "הַשְּׁבִיעִ֔י", "שַׁבָּ֖ת", "לַיהוָ֣ה", "אֱלֹהֶ֑יךָ", "לֹֽא־תַעֲשֶׂ֨ה", "כָל־מְלָאכָ֜ה", "אַתָּ֣ה", "וּבִנְךָֽ־וּבִתֶּ֗ךָ", "עַבְדְּךָ֤", "וַאֲמָֽתְךָ֙", "וּבְהֶמְתֶּ֔ךָ", "וְגֵרְךָ֖", "אֲשֶׁ֥ר", "בִּשְׁעָרֶֽיךָ׃"],
    11: ["כִּ֣י", "שֵֽׁשֶׁת־יָמִים֩", "עָשָׂ֨ה", "יְהוָ֜ה", "אֶת־הַשָּׁמַ֣יִם", "וְאֶת־הָאָ֗רֶץ", "אֶת־הַיָּם֙", "וְאֶת־כָּל־אֲשֶׁר־בָּ֔ם", "וַיָּ֖נַח", "בַּיּ֣וֹם", "הַשְּׁבִיעִ֑י", "עַל־כֵּ֗ן", "בֵּרַ֧ךְ", "יְהוָ֛ה", "אֶת־י֥וֹם", "הַשַּׁבָּ֖ת", "וַֽיְקַדְּשֵֽׁהוּ׃"],
    12: ["כַּבֵּ֥ד", "אֶת־אָבִ֖יךָ", "וְאֶת־אִמֶּ֑ךָ", "לְמַ֨עַן֙", "יַאֲרִכ֣וּן", "יָמֶ֔יךָ", "עַ֚ל", "הָאֲדָמָ֔ה", "אֲשֶׁר־יְהוָ֥ה", "אֱלֹהֶ֖יךָ", "נֹתֵ֥ן", "לָֽךְ׃"],
    13: ["לֹ֖א", "תִֿרְצָֽח׃"],
    14: ["לֹ֖א", "תִֿנְאָֽף׃"],
    15: ["לֹ֖א", "תִֿגְנֹֽב׃"],
    16: ["לֹֽא־תַעֲנֶ֥ה", "בְרֵעֲךָ֖", "עֵ֥ד", "שָֽׁקֶר׃"],
    17: ["לֹ֥א", "תַחְמֹ֖ד", "בֵּ֣ית", "רֵעֶ֑ךָ", "לֹֽא־תַחְמֹ֞ד", "אֵ֣שֶׁת", "רֵעֶ֗ךָ", "וְעַבְדּ֤וֹ", "וַאֲמָתוֹ֙", "וְשׁוֹר֣וֹ", "וַחֲמֹר֔וֹ", "וְכֹ֖ל", "אֲשֶׁ֥ר", "לְרֵעֶֽךָ׃"]
}

# 6. Transliteration for Hebrew
def transliterate_hebrew_word(word):
    stripped = ""
    for ch in word:
        code = ord(ch)
        if 0x0591 <= code <= 0x05AF:
            continue
        stripped += ch
    
    mapping = {
        "\u05D0": "'", "\u05D1": "v", "\u05D2": "g", "\u05D3": "d", "\u05D4": "h",
        "\u05D5": "v", "\u05D6": "z", "\u05D7": "ch", "\u05D8": "t", "\u05D9": "y",
        "\u05DA": "kh", "\u05DB": "kh", "\u05DC": "l", "\u05DD": "m", "\u05DE": "m",
        "\u05DF": "n", "\u05E0": "n", "\u05E1": "s", "\u05E2": "'", "\u05E3": "f",
        "\u05E4": "f", "\u05E5": "ts", "\u05E6": "ts", "\u05E7": "q", "\u05E8": "r",
        "\u05E9": "sh", "\u05EA": "t",
        "\u05B8": "a", "\u05B7": "a", "\u05B2": "a",
        "\u05B5": "e", "\u05B6": "e", "\u05B1": "e", "\u05B0": "e",
        "\u05B4": "i", "\u05B9": "o", "\u05BA": "o", "\u05B3": "o",
        "\u05BB": "u", "\u05BC": "", "\u05C1": "", "\u05C2": ""
    }
    
    res = []
    i = 0
    while i < len(stripped):
        c = stripped[i]
        if c == "\u05D1" and i + 1 < len(stripped) and stripped[i+1] == "\u05BC":
            res.append("b")
            i += 2
            continue
        if (c == "\u05DB" or c == "\u05DA") and i + 1 < len(stripped) and stripped[i+1] == "\u05BC":
            res.append("k")
            i += 2
            continue
        if (c == "\u05E4" or c == "\u05E3") and i + 1 < len(stripped) and stripped[i+1] == "\u05BC":
            res.append("p")
            i += 2
            continue
        if c == "\u05E9" and i + 1 < len(stripped) and stripped[i+1] == "\u05C2":
            res.append("s")
            i += 2
            continue
        if c in mapping:
            res.append(mapping[c])
        i += 1
    
    t = "".join(res)
    t = re.sub(r"e+", "e", t)
    t = re.sub(r"'+", "'", t)
    return t.capitalize() if t else word

# Transliteration for Greek
GREEK_MAP = {
    'α': 'a', 'ά': 'a', 'ὰ': 'a', 'ᾶ': 'a', 'ἀ': 'a', 'ἁ': 'ha', 'ἂ': 'a', 'ἃ': 'ha', 'ἄ': 'a', 'ἅ': 'ha', 'ἆ': 'a', 'ἇ': 'ha',
    'β': 'b', 'γ': 'g', 'δ': 'd',
    'ε': 'e', 'έ': 'e', 'ὲ': 'e', 'ἐ': 'e', 'ἑ': 'he', 'ἔ': 'e', 'ἕ': 'he',
    'ζ': 'z',
    'η': 'e', 'ή': 'e', 'ὴ': 'e', 'ῆ': 'e', 'ἠ': 'e', 'ἡ': 'he', 'ἤ': 'e', 'ἥ': 'he', 'ἦ': 'e', 'ἧ': 'he',
    'θ': 'th',
    'ι': 'i', 'ί': 'i', 'ὶ': 'i', 'ῖ': 'i', 'ἰ': 'i', 'ἱ': 'hi', 'ἴ': 'i', 'ἵ': 'hi', 'ἶ': 'i', 'ἷ': 'hi',
    'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
    'ο': 'o', 'ό': 'o', 'ὸ': 'o', 'ὀ': 'o', 'ὁ': 'ho', 'ὄ': 'o', 'ὅ': 'ho',
    'π': 'p', 'ρ': 'r', 'ῥ': 'rh', 'σ': 's', 'ς': 's', 'τ': 't',
    'υ': 'y', 'ύ': 'y', 'ὺ': 'y', 'ῦ': 'y', 'ὐ': 'y', 'ὑ': 'hy', 'ὔ': 'y', 'ὕ': 'hy',
    'φ': 'ph', 'χ': 'ch', 'ψ': 'ps',
    'ω': 'o', 'ώ': 'o', 'ὼ': 'o', 'ῶ': 'o', 'ὠ': 'o', 'ὡ': 'ho', 'ὤ': 'o', 'ὥ': 'ho', 'ὦ': 'o', 'ὧ': 'ho'
}

def transliterate_greek_word(word):
    res = []
    clean = word.lower()
    for ch in clean:
        if ch in GREEK_MAP:
            res.append(GREEK_MAP[ch])
        elif ch.isalpha():
            res.append(ch)
    t = "".join(res)
    return t.capitalize() if t else word

def lookup_lexicon(strong_code):
    if not strong_code:
        return None
    code_norm = re.sub(r"^([HG])0+", r"\1", strong_code)
    return lex_data.get(code_norm) or lex_data.get(strong_code)

def get_word_gloss(strong_code, fallback=""):
    lex = lookup_lexicon(strong_code)
    if not lex:
        return fallback or "[termo]"
    usage = lex.get("outline_usage") or lex.get("strongs_def") or ""
    first_part = usage.split(",")[0].split(";")[0].split("(")[0].strip()
    first_part = re.sub(r"<[^>]+>", "", first_part).strip()
    if first_part and len(first_part) < 30:
        return first_part
    return fallback or "[termo]"

print("Compiling 66 Canonical Bible Books...")
output_dir = "src/data/bible"
os.makedirs(output_dir, exist_ok=True)

# Process Old Testament Books
ot_books = list(HE_KEY.keys())
for book_id in ot_books:
    he_name = HE_KEY[book_id]
    pt_abbr = PT_ABBR[book_id]
    
    if he_name not in he_books:
        continue
    
    chapters_he = he_books[he_name]
    chapters_pt = pt_map.get(pt_abbr, [])
    
    book_chapters = {}
    
    for c_idx, chap_he_verses in enumerate(chapters_he):
        chap_num = c_idx + 1
        chap_pt_verses = chapters_pt[c_idx] if c_idx < len(chapters_pt) else []
        
        verse_list = []
        for v_idx, words_raw in enumerate(chap_he_verses):
            verse_num = v_idx + 1
            
            # Decalogue check for Exodus 20
            if book_id == "EXO" and chap_num == 20 and verse_num in EXO_20_CLEAN:
                words_he = EXO_20_CLEAN[verse_num]
            else:
                words_he = [clean_kethiv_qere(w) for w in words_raw if w not in ["פ", "ס"]]
            
            if not words_he:
                continue
            
            orig_full = " ".join(words_he)
            pt_verse_text = chap_pt_verses[v_idx] if v_idx < len(chap_pt_verses) else ""
            
            # Strongs for verse
            ref_str = f"{book_id}-{chap_num:03d}-{verse_num:03d}"
            strongs_list = get_verse_strongs(ref_str)
            
            tokens = []
            trans_list = []
            
            for w_idx, w_he in enumerate(words_he):
                w_trans = transliterate_hebrew_word(w_he)
                trans_list.append(w_trans)
                
                st_code = strongs_list[w_idx] if w_idx < len(strongs_list) else (strongs_list[-1] if strongs_list else "H0000")
                lex = lookup_lexicon(st_code)
                
                gloss = get_word_gloss(st_code, w_trans)
                morph = lex.get("part_of_speech") if lex else "Subst. / Verbo Massorético"
                lemma = lex.get("Hb_word") if lex else w_he
                
                tokens.append({
                    "id": f"{book_id.lower()}-{chap_num}-{verse_num}-{w_idx+1}",
                    "original": w_he,
                    "transliteration": w_trans,
                    "translation": gloss,
                    "strong": st_code,
                    "morphology": morph or "Hebraico Bíblico",
                    "lemma": lemma or w_he,
                    "definition": (lex.get("outline_usage") or "")[:120] if lex else ""
                })
            
            verse_obj = {
                "bookId": book_id,
                "chapter": chap_num,
                "verse": verse_num,
                "testament": "VT",
                "language": "hebrew",
                "originalFull": orig_full,
                "transliterationFull": " ".join(trans_list),
                "portuguese": pt_verse_text,
                "words": tokens
            }
            verse_list.append(verse_obj)
        
        book_chapters[str(chap_num)] = verse_list
    
    book_file = os.path.join(output_dir, f"{book_id}.json")
    with open(book_file, "w", encoding="utf-8") as out:
        json.dump({"bookId": book_id, "chapters": book_chapters}, out, ensure_ascii=False)

print("OT Books processed cleanly.")

# Process New Testament Books from SBLGNT
nt_books = list(SBLGNT_FILES.keys())
for book_id in nt_books:
    txt_filename = SBLGNT_FILES[book_id]
    txt_path = f"/tmp/sblgnt/{txt_filename}"
    pt_abbr = PT_ABBR[book_id]
    chapters_pt = pt_map.get(pt_abbr, [])
    
    if not os.path.exists(txt_path):
        continue
    
    with open(txt_path, "r", encoding="utf-8") as f:
        sbl_lines = [l.strip() for l in f if l.strip()]
    
    chap_verses_map = {}
    for line in sbl_lines:
        parts = line.split(" ")
        if len(parts) < 6:
            continue
        ref = parts[0]
        c_num = int(ref[2:4])
        v_num = int(ref[4:6])
        pos = parts[1]
        parse_code = parts[2]
        word_punctuated = parts[3]
        word_norm = parts[4]
        lemma = parts[6] if len(parts) > 6 else parts[5]
        
        if c_num not in chap_verses_map:
            chap_verses_map[c_num] = {}
        if v_num not in chap_verses_map[c_num]:
            chap_verses_map[c_num][v_num] = []
        
        chap_verses_map[c_num][v_num].append({
            "word": word_punctuated,
            "norm": word_norm,
            "lemma": lemma,
            "pos": pos,
            "parse": parse_code
        })
    
    book_chapters = {}
    for c_num in sorted(chap_verses_map.keys()):
        chap_pt_verses = chapters_pt[c_num - 1] if (c_num - 1) < len(chapters_pt) else []
        verse_list = []
        
        for v_num in sorted(chap_verses_map[c_num].keys()):
            words_data = chap_verses_map[c_num][v_num]
            orig_words = [w["word"] for w in words_data]
            orig_full = " ".join(orig_words)
            pt_verse_text = chap_pt_verses[v_num - 1] if (v_num - 1) < len(chap_pt_verses) else ""
            
            ref_str = f"{book_id}-{c_num:03d}-{v_num:03d}"
            strongs_list = get_verse_strongs(ref_str)
            
            tokens = []
            trans_list = []
            
            for w_idx, w_obj in enumerate(words_data):
                w_grk = w_obj["word"]
                w_trans = transliterate_greek_word(w_grk)
                trans_list.append(w_trans)
                
                st_code = strongs_list[w_idx] if w_idx < len(strongs_list) else (strongs_list[-1] if strongs_list else "G0000")
                lex = lookup_lexicon(st_code)
                
                gloss = get_word_gloss(st_code, w_trans)
                tokens.append({
                    "id": f"{book_id.lower()}-{c_num}-{v_num}-{w_idx+1}",
                    "original": w_grk,
                    "transliteration": w_trans,
                    "translation": gloss,
                    "strong": st_code,
                    "morphology": f"{w_obj['pos']} ({w_obj['parse']})",
                    "lemma": w_obj["lemma"],
                    "definition": (lex.get("outline_usage") or "")[:120] if lex else ""
                })
            
            verse_obj = {
                "bookId": book_id,
                "chapter": c_num,
                "verse": v_num,
                "testament": "NT",
                "language": "greek",
                "originalFull": orig_full,
                "transliterationFull": " ".join(trans_list),
                "portuguese": pt_verse_text,
                "words": tokens
            }
            verse_list.append(verse_obj)
        
        book_chapters[str(c_num)] = verse_list
    
    book_file = os.path.join(output_dir, f"{book_id}.json")
    with open(book_file, "w", encoding="utf-8") as out:
        json.dump({"bookId": book_id, "chapters": book_chapters}, out, ensure_ascii=False)

print("All 66 Canonical Bible Books updated and compiled successfully!")
