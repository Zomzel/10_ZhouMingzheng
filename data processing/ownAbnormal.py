import json


# Load the hieTree.json file (assuming it's already loaded)
# Replace 'path_to_hieTree.json' with the actual path to your file
with open('./data/hieTree.json', 'r') as file:
    hie_tree = json.load(file)

# Function to find illegal nodes in a hierarchy tree
def find_illegal_nodes(hierarchy_tree):
    illegal_nodes = set()

    # Iterate through each tree in the hierarchy
    for tree_name, tree_root in hierarchy_tree.items():
        # Identify the root node's name
        tree = tree_root[0]
        root_name = tree['name']

        # Function to recursively traverse the tree and find illegal nodes
        def traverse_tree(node, visited_nodes):
            if node['name'] == root_name and node['name'] in visited_nodes:
                illegal_nodes.add(node['name'])
                return
            elif node['name'] in visited_nodes:
                return
            visited_nodes.add(node['name'])
            for child_node in node.get('children', []):
                traverse_tree(child_node, visited_nodes)

        # Start traversing the tree from the root
        traverse_tree(tree, set())

    return illegal_nodes


# Find illegal nodes in the loaded hierarchy tree
illegal_nodes = find_illegal_nodes(hie_tree)


#
# Save the illegal and legal nodes as JSON files
print(len(illegal_nodes))
print(illegal_nodes)
with open("./data/illegalIDs.json", 'w') as illegal_file:
    json.dump(list(illegal_nodes), illegal_file)

# with open(legal_nodes_path, 'w') as legal_file:
#     json.dump(list(legal_nodes), legal_file)
