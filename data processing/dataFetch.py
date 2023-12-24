from ucimlrepo import fetch_ucirepo
import pandas as pd
import dataframe_image as dfi

import numpy as np
# fetch dataset
wine = fetch_ucirepo(id=109)

# data (as pandas dataframes)
X = wine.data.features
y = wine.data.targets
print(X.shape)
print(y.shape)

subdata = X.head(5)
dfi.export(obj=subdata, filename="wine.jpg")

# metadata
# print(wine.metadata)

# variable information
# print(wine.variables)

# features = pd.DataFrame(X)
# target = pd.DataFrame(y)
#
# features.to_csv("wine.csv")
# target.to_csv("label.csv")