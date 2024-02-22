const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// function to simplify & flatten API output
// input must be an array
const apiOutput = (tagArr) => tagArr.map(tag => {
  let output = {};
  output.tagID = tag.id,
    output.tagName = tag.tag_name,
    output.products = tag.products.map(product => {
      let obj = {};
      obj.productID = product.id;
      obj.product = product.product_name;
      obj.price = product.price;
      obj.stock = product.stock;
      obj.categoryID = product.category_id;
      return obj;
    });
  return output;
});

router.get('/', async (req, res) => {
  // find all tags
  try {
    const allTags = await Tag.findAll({
      include: Product
    });
    // Choose one of the following responses, commenting the other
    // the 1st gives a more readable format, the 2nd gives all output
    res.status(200).json(apiOutput(allTags));
    // res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const oneTag = await Tag.findByPk(req.params.id, {
      include: Product
    });
    if (oneTag) {
      // Choose one of the following responses, commenting the other
      // the 1st gives a more readable format, the 2nd gives all output
      res.status(200).json(apiOutput([oneTag]));
      // res.status(200).json(oneTag);
    } else {
      res.status(400).json("No tags with that ID.")
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  /** To create a new tag, request shoule pass a (JSON-ified) object
   * with the key containing the tag name, such as shown below
   {
     tag_name: "On sale"
   }
   **/
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
  // update a tag's name by its `id` value. Request
  /** To update a tag's name, request shoule pass a (JSON-ified) object
   * with the key containing the tag name, such as shown below
   {
     tag_name: "On sale"
   }
   **/
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
