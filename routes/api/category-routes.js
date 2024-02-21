const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categories = await Category.findAll({
      attributes: [['id', 'categoryID'], ['category_name', 'category']],
      include: [{
        model: Product,
        attributes: [
          ['id', 'productID'], ['product_name', 'product'], 'price', 'stock'
        ]
      }],
    });
    if (categories) {
      res.status(200).json(categories);
    } else {
      res.status(404).send("No categories found.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const singleCategory = await Category.findByPk(req.params.id, {
      attributes: [['id', 'categoryID'], ['category_name', 'category']],
      include: [{
        model: Product,
        attributes: [
          ['id', 'productID'], ['product_name', 'product'], 'price', 'stock'
        ]
      }],
    });

    // be more explicit about a category not existing
    if (singleCategory) res.status(200).json(singleCategory);
    else res.status(200).json('That category does not exist');

  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name
    });
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    updatedCategory = await Category.update(
      {
        category_name: req.body.category_name
      },
      { where: { id: req.params.id } }
    );
    if (updatedCategory[0] !== 0) {
      res.status(200).json(`Name of category ${req.params.id} updated to ${req.body.category_name}.`);
    } else {
      res.status(200).json('No such category exists to update');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const deletedCategory = await Category.destroy({ where: { id: req.params.id } });
    if (deletedCategory) res.status(200).json(`Deleted category ${req.params.id}`);
    else res.status(200).json("A category with that ID doesn't exist.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
