const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const allTags = await Tag.findAll({
      attributes: [
        ['id', 'tagID'],
        ['tag_name', 'tag']
      ],
      include: {
        model: Product,
        attributes: [
          ['id', 'productID'],
          ['product_name', 'product'],
          'price',
          'stock',
          ['category_id', 'categoryID']
        ]
      }
    });
    res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const oneTag = await Tag.findByPk(req.params.id, {
      attributes: [
        ['id', 'tagID'],
        ['tag_name', 'tag']
      ],
      include: {
        model: Product,
        attributes: [
          ['id', 'productID'],
          ['product_name', 'product'],
          'price',
          'stock',
          ['category_id', 'categoryID']
        ]
      }
    });
    res.status(200).json(oneTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create({
      tag_name: req.body.tag_name
    });
    res.status(200).json(newTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const updatedTag = await Tag.update(
      {
        tag_name: req.body.tag_name
      },
      { where: { id: req.params.id } }
    );
    if (updatedTag[0] !== 0) {
      res.status(200).json(`Name of tag ${req.params.id} updated to ${req.body.tag_name}.`);
    } else {
      res.status(400).json('No such tag exists to update.');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const deletedTag = await Tag.destroy({
      where: { id: req.params.id }
    });
    if (deletedTag) {
      res.status(200).json(`Deleted tag ${req.params.id}`);
    } else {
      res.status(400).json("A tag with that ID doesn't exist.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
