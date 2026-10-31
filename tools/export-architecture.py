#!/usr/bin/env python3
"""Turn graphify's graph of this site into the data the Architecture page draws.

    python3 tools/export-architecture.py

Reads graphify-out/graph.json (built by `/graphify .`, kept out of git) and
writes architecture/graph.json. Standard library only.

Three things change on the way:
- A real-world thing named in several files (you, an employer, BMU) is one node
  per file in graphify's output; here it becomes one node that lists every file.
- Notes the extraction got wrong are corrected in FIXES, by node id.
- graphify's bookkeeping fields are dropped; nothing private is in the graph,
  since it is built from this public repository.
"""
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "graphify-out" / "graph.json"
TARGET = ROOT / "architecture" / "graph.json"

# Corrections to the extracted notes, keyed by node id.
FIXES = {
    "index_exam_status": "Where each exam stands, read by the ACCA map. The hero's progress panel, "
                         "the journey's Next card and the results strip repeat it by hand, so all four change together.",
}
REPLACE = [("at 24fps cap", "at most once every 24ms")]

RELATIONS = {
    "calls": "calls", "references": "refers to", "conceptually_related_to": "related to",
    "implements": "implements", "shares_data_with": "shares data with",
    "semantically_similar_to": "similar to", "rationale_for": "explains",
}
KINDS = {"code": "code", "document": "page", "paper": "page", "image": "page", "concept": "idea", "rationale": "reason"}


def base_label(label):
    """The name without its parenthetical: 'Exely (Technical Specialist)' -> 'exely'."""
    return re.sub(r"\s*\(.*$", "", label).strip().lower()


def main():
    g = json.loads(SOURCE.read_text(encoding="utf-8"))
    nodes = {n["id"]: n for n in g["nodes"]}

    # One node per real-world thing: ideas and pages with the same name from different files.
    groups = defaultdict(list)
    for n in g["nodes"]:
        if n["file_type"] in ("concept", "document"):
            groups[base_label(n["label"])].append(n["id"])
    alias = {}
    for ids in groups.values():
        if len({nodes[i]["source_file"] for i in ids}) < 2:
            continue
        keep = next((i for i in ids if nodes[i]["source_file"] == "index.html"), ids[0])
        for i in ids:
            alias[i] = keep
    canon = lambda i: alias.get(i, i)

    out_nodes = {}
    for n in g["nodes"]:
        cid = canon(n["id"])
        src = {"file": n["source_file"], "line": int(n["source_location"][1:]) if (n.get("source_location") or "").startswith("L") else None}
        why = FIXES.get(n["id"], n.get("rationale"))
        for old, new in REPLACE:
            why = why.replace(old, new) if why else why
        node = out_nodes.get(cid)
        if node is None:
            out_nodes[cid] = node = {"id": cid, "label": n["label"], "kind": KINDS.get(n["file_type"], "idea"),
                                     "area": n["community"], "sources": [], "why": why}
        else:
            # merged: keep the fuller name, call a person or company an idea, keep any note
            if len(n["label"]) > len(node["label"]):
                node["label"] = n["label"]
            if n["file_type"] == "concept":
                node["kind"] = "idea"
            node["why"] = node["why"] or why
        if src not in node["sources"]:
            node["sources"].append(src)

    links, seen = [], set()
    for e in g["links"]:
        s, t = canon(e["source"]), canon(e["target"])
        key = (s, t, e["relation"])
        if s == t or key in seen or s not in out_nodes or t not in out_nodes:
            continue
        seen.add(key)
        links.append({"source": s, "target": t, "relation": RELATIONS.get(e["relation"], e["relation"].replace("_", " ")),
                      "inferred": e["confidence"] != "EXTRACTED"})

    degree = defaultdict(int)
    for l in links:
        degree[l["source"]] += 1
        degree[l["target"]] += 1
    for node in out_nodes.values():
        node["degree"] = degree[node["id"]]
        if not node["why"]:
            del node["why"]

    names = {n["community"]: n["community_name"] for n in g["nodes"]}
    # sentence case, keeping acronyms and file names as written
    keep = {"ACCA", "CV", "404"}
    names = {k: " ".join(w if (i == 0 or w in keep) else w.lower() for i, w in enumerate(v.split())) for k, v in names.items()}
    sizes = defaultdict(int)
    for node in out_nodes.values():
        sizes[node["area"]] += 1
    areas = [{"id": a, "name": names[a], "size": sizes[a]} for a in sorted(sizes, key=lambda a: -sizes[a])]

    sets = [{"label": h["label"], "nodes": sorted({canon(i) for i in h["nodes"] if canon(i) in out_nodes})}
            for h in g["graph"].get("hyperedges", [])]

    data = {
        "built": date.today().isoformat(),
        "commit": g.get("built_at_commit"),
        "graphify": g["graph"].get("graphify_version"),
        "areas": areas,
        "nodes": sorted(out_nodes.values(), key=lambda n: -n["degree"]),
        "links": links,
        "sets": sets,
    }
    TARGET.parent.mkdir(exist_ok=True)
    TARGET.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    merged = len(alias) - len(set(alias.values()))
    print(f"{TARGET.relative_to(ROOT)}: {len(out_nodes)} nodes ({merged} duplicates merged), {len(links)} links, {len(areas)} areas")


if __name__ == "__main__":
    main()
