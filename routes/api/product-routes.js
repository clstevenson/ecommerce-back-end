const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// function to simplify & flatten API output
// input must be an array
const apiOutput = (productArr) => productArr.map(product => {
  let output = {};
  output.productID = product.id;
  output.productName = product.product_name;
  output.price = product.price;
  output.stock = product.stock;
  output.categoryID = product.categoryId;
  // NULL categories are allowed, need to test for that
  if (product.category) output.category = product.category.category_name;
  output.tagIDs = product.tags.map(tag => tag.id);
  output.tags = product.tags.map(tag => tag.tag_name);
  return output;
});

// function to check a list of tag IDs for validity
// input is an array of tag IDs, function returns a boolean
const checkTagIDs = async (tagIDarr) => {
  for (const id of tagIDarr) {
    const exists = await Tag.findByPk(id);
    if (!exists) return false;
  }
  return true;
}

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const allProducts = await Product.findAll({
      include: [Category, Tag]
    });
    if (allProducts.length > 0) {
      // uncomment one of the following two lines
      // first option is more readable, 2nd is raw sequelize output
      res.status(200).json(apiOutput(allProducts));
      // res.status(200).json(allProducts);
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
      include: [Category, Tag]
    });
    if (oneProduct) {
      // uncomment one of the following (2nd is raw output)
      // first option is more readable, 2nd is raw sequelize output
      res.status(200).json(apiOutput([oneProduct]));
      // res.status(200).json(oneProduct);
    } else {
      res.status(400).json('That product does not exist');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this (submit as JSON).
   * Some values (stock, category_id, tagIDs) can be left off either bc NULL is
   * allowed or there are default values. Others must be included or an error will
   * be thrown. Note that tagIDs must be an array, even if just 1 ID; use an
   * empty array for no tag IDs.
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 2,
      tagIds: [1, 2, 3, 4]
    }
  */

  // check if there is a submitted category ID and if it exists
  if (req.body.category_id) {
    // don't check validity unless a value is actually submitted
    const existsCategory = await Category.findByPk(req.body.category_id);
    if (!existsCategory) {
      res.status(400).json("Error: category ID does not exist.");
      return;
    };
  };

  // check that each Tag ID is valid
  allTagsExist = await checkTagIDs(req.body.tagIds);
  if (!allTagsExist) {
    res.status(400).json("Error: at least one of the tag IDs does not exist.");
    return;
  };

  try {
    const newProduct = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create
    // in the ProductTag model
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
  /* req.body should look like this (submit as JSON).
   * Some values (stock, category_id, tagIDs) can be left off either bc NULL is
   * allowed or there are default values. Others must be included or an error will
   * be thrown. Note that tagIDs must be an array, even if just 1 ID; use an
   * empty array for no tag IDs.
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 2,
      tagIds: [1, 2, 3, 4]
    }
  */

  // test if the product ID exists
  const validProductID = await Product.findByPk(req.params.id);
  if (!validProductID) {
    res.status(400).json("Error: product ID does not exist.");
    return;
  };

  // Now do the same for the category ID
  if (req.body.category_id) {
    // don't check validity unless a value is actually submitted
    const existsCategory = await Category.findByPk(req.body.category_id);
    if (!existsCategory) {
      res.status(400).json("Error: category ID does not exist.");
      return;
    };
  };

  // Finally check that each Tag ID is valid
  allTagsExist = await checkTagIDs(req.body.tagIds);
  if (!allTagsExist) {
    res.status(400).json("Error: at least one of the tag IDs does not exist.");
    return;
  };

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
