const flattenData = (data) => {
  const result = [];

  // console.log(data)
  const traverse = (node, parentId = null) => {
    if (node.type === 'folder') {
      result.push({
        type: 'folder',
        id: node.id,
        isStared: node.is_stared,
        parent_id: node.parent_id || parentId,
        name: node.name,
        created_at: node.created_at,
        updated_at: node.updated_at,
        color: node.color,
      });

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, node.id));
      }
    } else if (node.type === 'document') {
      result.push({
        type: 'document',
        id: node.id,
        isStared: node.is_stared,
        parent_id: node.directory_id || parentId,
        name: node.name,
        content: node.content || "",
        created_at: node.created_at,
        updated_at: node.updated_at,
      });
    }
  };

  Array.isArray(data) ? data.forEach(item => traverse(item)) : traverse(data);
  return result;
};

export default flattenData;