import json, html, re, glob, os

print("=== Starting Greek & Hebrew Lexicon Fixer ===")

def clean_html(s):
    if not s:
        return ""
    s = html.unescape(s)
    s = s.replace("&quot", "\"").replace("&amp", "&").replace("&apos", "'").replace("&lt", "<").replace("&gt", ">")
    s = re.sub(r'=\s*"[^"]*"', '', s) # remove Asia = " orient"
    s = s.replace('"', '').replace('=', '').strip()
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# Curated high-precision Portuguese vocabulary and Strong codes for common lemmas
LEMMA_OVERRIDE = {
    "εἰμί": {
        "strong": "G1510",
        "pt": "ser / é / era",
        "def": "Verbo existir, ser, permanecer. Em Apocalipse, designa o Deus Eterno Autoexistente (Aquele que é, que era e que há de vir)."
    },
    "χάρις": {
        "strong": "G5485",
        "pt": "graça",
        "def": "Favor divino imerecido, amor benevolente e salvífico de Deus concedido à humanidade."
    },
    "εἰρήνη": {
        "strong": "G1515",
        "pt": "paz",
        "def": "Paz, reconciliação espiritual, harmonia e salvação plena (equivalente ao Shalom hebraico)."
    },
    "ἔρχομαι": {
        "strong": "G2064",
        "pt": "vir / há de vir",
        "def": "Aproximar-se, chegar. Em Ap 1:4 e 1:8, ὁ ἐρχόμενος proclama o retorno triunfante de Cristo na Sua glória."
    },
    "πνεῦμα": {
        "strong": "G4151",
        "pt": "Espírito",
        "def": "Espírito, fôlego de vida, o Espírito Santo de Deus em Sua plenitude perfeita."
    },
    "θρόνος": {
        "strong": "G2362",
        "pt": "trono",
        "def": "Trono real, assento da soberania de Deus no santuário celestial de onde emana o governo do cosmos."
    },
    "ἑπτά": {
        "strong": "G2033",
        "pt": "sete",
        "def": "Número cardinal sete, símbolo bíblico por excelência de plenitude, integridade e perfeição sagrada."
    },
    "Ἀσία": {
        "strong": "G0773",
        "pt": "Ásia",
        "def": "Província romana da Ásia Menor ocidental, onde ficavam as sete igrejas históricas destinatárias da carta."
    },
    "Ἰωάννης": {
        "strong": "G2491",
        "pt": "João",
        "def": "João (hebraico Yohanan = Deus é gracioso), apóstolo e discípulo amado, exilado em Patmos."
    },
    "Ἰησοῦς": {
        "strong": "G2424",
        "pt": "Jesus",
        "def": "Jesus (Yeshua = Yahweh é salvação), o Filho de Deus encarnado, o Cordeiro pascal."
    },
    "Χριστός": {
        "strong": "G5547",
        "pt": "Cristo",
        "def": "Cristo (equivalente grego de Mashiach / Messias = o Ungido de Deus)."
    },
    "θεός": {
        "strong": "G2316",
        "pt": "Deus",
        "def": "Deus, o Criador supremo, Juiz dos povos e Pai eterno."
    },
    "κύριος": {
        "strong": "G2962",
        "pt": "Senhor",
        "def": "Senhor, Soberano Mestre de todos os mundos, tradução de YHWH na Septuaginta."
    },
    "ἐκκλησία": {
        "strong": "G1577",
        "pt": "igreja",
        "def": "Igreja, comunidade dos que foram chamados para fora do mundo para pertencerem a Cristo."
    },
    "ἀπό": {
        "strong": "G0575",
        "pt": "de / da parte de",
        "def": "Preposição de procedência: de, da parte de, desde a origem."
    },
    "ἐν": {
        "strong": "G1722",
        "pt": "em / no / na",
        "def": "Preposição de esfera, comunhão e lugar: em, dentro de, no meio de."
    },
    "ὁ": {
        "strong": "G3588",
        "pt": "o / a / aquele que",
        "def": "Artigo definido grego. Com particípios, denota 'Aquele que', definindo a identidade pessoal divina."
    },
    "καί": {
        "strong": "G2532",
        "pt": "e / também",
        "def": "Conjunção coordenativa aditiva: e, também, igualmente."
    },
    "σύ": {
        "strong": "G4771",
        "pt": "vós / a vós",
        "def": "Pronome pessoal de segunda pessoa: vós, a vós outros."
    },
    "αὐτός": {
        "strong": "G0846",
        "pt": "ele / seu / Dele",
        "def": "Pronome pessoal enfático e possessivo: ele, Ele mesmo, Dele."
    },
    "ὅς": {
        "strong": "G3739",
        "pt": "que / o qual",
        "def": "Pronome relativo: que, o qual, os quais."
    },
    "ἐνώπιον": {
        "strong": "G1799",
        "pt": "diante de",
        "def": "Na presença de, perante os olhos de, diante da face de Deus."
    },
    "ἀποκάλυψις": {
        "strong": "G0602",
        "pt": "revelação",
        "def": "Ato de tirar o véu, manifestação profética das coisas celestiais e do futuro."
    },
    "λόγος": {
        "strong": "G3056",
        "pt": "Palavra",
        "def": "Palavra, revelação articulada de Deus, o Verbo divino eterno."
    },
    "ἀμήν": {
        "strong": "G0281",
        "pt": "amém",
        "def": "Amém (hebraico = certamente, verdadeiro, que assim seja)."
    },
    "ἄλφα": {
        "strong": "G01Alpha",
        "pt": "Alfa",
        "def": "Primeira letra do alfabeto grego, símbolo do início de todas as coisas em Deus."
    },
    "ὦ": {
        "strong": "G5598",
        "pt": "Ômega",
        "def": "Última letra do alfabeto grego, símbolo da consumação e destino final em Deus."
    }
}

# Specific contextual words for participles in Revelation 1:4 and 1:8
WORD_SPECIFIC_FIX = {
    "ὢν": {
        "strong": "G5607",
        "pt": "que é",
        "def": "Particípio presente de εἰμί (ser/existir). Em Ap 1:4, ὁ ὢν refere-se ao Pai como o Eterno Autoexistente ('Aquele que é')."
    },
    "ἦν": {
        "strong": "G1510",
        "pt": "que era",
        "def": "Pretérito imperfeito de εἰμί. Em Ap 1:4, ὁ ἦν proclama Aquele que sempre foi e existiu na eternidade passada."
    },
    "ἐρχόμενος,": {
        "strong": "G2064",
        "pt": "que há de vir",
        "def": "Particípio de ἔρχομαι. Em Ap 1:4, ὁ ἐρχόμενος designa a vinda triunfal de Deus na história e no juízo final."
    },
    "ἐρχόμενος": {
        "strong": "G2064",
        "pt": "que há de vir",
        "def": "Particípio de ἔρχομαι. Em Ap 1:4, ὁ ἐρχόμενος designa a vinda triunfal de Deus na história e no juízo final."
    }
}

# Process each json file in src/data/bible
files = glob.glob("src/data/bible/*.json")
fixed_words_count = 0

for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    b_id = data.get("bookId")
    is_nt = b_id in ["MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"]
    modified = False

    for c_num, verses in data.get("chapters", {}).items():
        for v in verses:
            words = v.get("words", [])
            for w in words:
                orig = w.get("original", "").strip()
                lem = w.get("lemma", "").strip()
                trans = w.get("translation", "")
                st = w.get("strong", "")
                
                # Check specific word override first (e.g. ὢν)
                if orig in WORD_SPECIFIC_FIX:
                    spec = WORD_SPECIFIC_FIX[orig]
                    w["strong"] = spec["strong"]
                    w["translation"] = spec["pt"]
                    w["definition"] = spec["def"]
                    fixed_words_count += 1
                    modified = True
                    continue
                
                # Check if lemma has override and either trans is Asia or &quot or empty
                if lem in LEMMA_OVERRIDE:
                    rule = LEMMA_OVERRIDE[lem]
                    if "Asia" in trans and not orig.startswith("Ἀσί"):
                        w["strong"] = rule["strong"]
                        w["translation"] = rule["pt"]
                        w["definition"] = rule["def"]
                        fixed_words_count += 1
                        modified = True
                        continue
                    elif "&quot" in trans or "&quot" in w.get("definition", ""):
                        w["strong"] = rule["strong"]
                        w["translation"] = rule["pt"]
                        w["definition"] = rule["def"]
                        fixed_words_count += 1
                        modified = True
                        continue
                    elif st == "G0000" or st == "G0773" and not orig.startswith("Ἀσί"):
                        w["strong"] = rule["strong"]
                        w["translation"] = rule["pt"]
                        w["definition"] = rule["def"]
                        fixed_words_count += 1
                        modified = True
                        continue
                
                # Clean html in any remaining word
                clean_t = clean_html(trans)
                clean_d = clean_html(w.get("definition", ""))
                if clean_t != trans or clean_d != w.get("definition", ""):
                    w["translation"] = clean_t
                    w["definition"] = clean_d
                    modified = True
    
    if modified:
        with open(fpath, "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False)

print(f"Fixed {fixed_words_count} word tokens in bible JSON files.")

# Also update interlinearCorpus.ts and extendedVerses.ts
for corpus_file in ["src/data/interlinearCorpus.ts", "src/data/extendedVerses.ts"]:
    with open(corpus_file, "r", encoding="utf-8") as f:
        code = f.read()
    
    cleaned = code.replace("&quot", "").replace("&amp", "&").replace("&apos", "'")
    if cleaned != code:
        with open(corpus_file, "w", encoding="utf-8") as f:
            f.write(cleaned)
        print(f"Cleaned HTML entities in {corpus_file}")

print("=== Greek & Hebrew Lexicon Fix Complete ===")
