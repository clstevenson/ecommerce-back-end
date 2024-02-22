const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const allProducts = await Product.findAll({
      attributes: [
        ['id', 'productID'],
        ['product_name', 'product'],
        'price',
        'stock',
      ],
      include: [{
        model: Category,
        attributes: [['id', 'categoryID'], ['category_name', 'category']]
      }, {
        model: Tag,
        attributes: [['id', 'tagID'], ['tag_name', 'tag']]
      }]
    });
    if (allProducts) {
      res.status(200).json(allProducts);
    } else {
      res.status(400).json('No products found.')
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const oneProduct = await Product.findByPk(req.params.id, {
      attributes: [
        ['id', 'productID'],
        ['product_name', 'product'],
        'price',
        'stock',
      ],
      include: [{
        model: Category,
        attributes: [['id', 'categoryID'], ['category_name', 'category']]
      }, {
        model: Tag,
        attributes: [['id', 'tagID'], ['tag_name', 'tag']]
      }]
    });
    if (oneProduct) {
      res.status(200).json(oneProduct);
    } else {
      res.status(400).json('That product does not exist');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
    TODO: add a category ID to the POST request
  */
  try {
    const newProduct = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      const newProductTag = await ProductTag.bulkCreate(productTagIdArr);
      // respond with the ProductTags records just created
      res.status(200).json(newProductTag);
    } else {
      // if no product tags, just respond with the (untagged) product
      res.status(200).json(newProduct);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    const updatedProduct = await Product.update(req.body, {
      where: { id: req.params.id, },
    });
    if (req.body.tagIds && req.body.tagIds.length) {
      // get all the ProductTag entries for this product
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      // create filtered list of NEW tag_ids for this product
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // figure out which tag IDs to remove (ie, which were not in the updated list of tag IDs)
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // create entries with the new tag IDs
      await ProductTag.bulkCreate(newProductTags);
      // remove the entries with the omitted tag IDs
      await ProductTag.destroy({ where: { id: productTagsToRemove } });
    } // end IF block

    // end the suspense by responding
    res.status(200).json(`Product ${req.params.id} was updated!`);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id }
    });
    if (deletedProduct) {
      res.status(200).json(`Deleted product ${req.params.id}`);
    } else {
      res.status(400).json("A product with that ID doesn't exist");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
