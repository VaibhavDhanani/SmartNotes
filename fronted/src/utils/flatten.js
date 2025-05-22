const flattenData = (data) => {
  const result = [];
  console.log(data)

  const traverse = (node, parentId = null) => {
    if (node.type === 'folder') {
      result.push({
        type: 'folder',
        id: node.dir_id,
        parent_id: parentId,
        name: node.dir_name,
        created_at: node.created_at,
        updated_at: node.updated_at,
        user_id: node.user_id,
        color: node.color,
      });

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, node.dir_id));
      }
    } else if (node.type === 'document') {
      result.push({
        type: 'document',
        id: node.doc_id,
        parent_id: node.directory_id || parentId,
        name: node.doc_name,
        content: node.content || "",
        created_at: node.created_at,
        updated_at: node.updated_at,
        user_id: node.user_id,
      });
    }
  };

  Array.isArray(data) ? data.forEach(item => traverse(item)) : traverse(data);
  return result;
};

export default flattenData;