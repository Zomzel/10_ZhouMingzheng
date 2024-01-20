import json

# 读取JSON文件
with open('./data/data.json', 'r') as file:
    data = json.load(file)

# 将字典中的所有键和值转换为字符串类型
# 输出转换后的字典

nodes = data["nodes"]
links = data["links"]

dataFormatted = {"nodes": [], "links": []}

for node in nodes:
    n = {"name": str(node["id"]), "label": str(node["label"]), "type": str(node["type"]),
         "class": str(node["type"]), "country": str(node["country"])}
    dataFormatted["nodes"].append(n)

for link in links:
    e = {"source": str(link["source"]), "target": str(link["target"]),
         "label": str(link["label"]), "type": str(link["label"]),
         "name": str(link["label"]), "weight": link["weight"]}
    dataFormatted["links"].append(e)

# with open("./data/dataFormatted.json", "w", encoding="utf-8") as f:
#     json.dump(dataFormatted, f, ensure_ascii=False, indent=4)


with open('./data/EhieTree.json', 'r') as file:
    hieData = json.load(file)


hieFormatted = {}

for hie in hieData.keys():
    name = str(hie)
    tree = hieData[name]
    hieFormatted[name] = tree

with open("./data/hieFormatted.json", "w", encoding="utf-8") as f:
    json.dump(hieFormatted, f, ensure_ascii=False, indent=4)
