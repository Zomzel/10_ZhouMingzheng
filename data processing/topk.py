import pandas as pd
import numpy as np

nodes = pd.read_csv("nodes.csv")

# 打开文件
with open('.\score\oval1', 'r', encoding='utf-8') as file:
   # 读取文件内容到一个列表中
   oval1 = file.readlines()

with open('.\score\oval2', 'r', encoding='utf-8') as file:
   # 读取文件内容到一个列表中
   oval2 = file.readlines()

with open('.\score\oval3', 'r', encoding='utf-8') as file:
   # 读取文件内容到一个列表中
   oval3 = file.readlines()

# 去除每行末尾的换行符
oval1 = [line.strip() for line in oval1]
oval2 = [line.strip() for line in oval2]
oval3 = [line.strip() for line in oval3]

score1 = [float(x)*1000 for x in oval1]
score2 = [float(x)*1000 for x in oval2]
score3 = [float(x)*1000 for x in oval3]
# 打印列表内容

avg_oval = [(a+b+c)/3 for a, b, c in zip(score1, score2, score3)]

nodes['avg_oval'] = avg_oval
sorted_nodes = nodes.sort_values(by='avg_oval', ascending=False)
k = 100
topk = list(sorted_nodes[0:100]['id'])
