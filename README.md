# E-Commerce Back End

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description
This Node.js application functions as an e-commerce back end; when paired with a suitable front end a user is able to manage products and inventory on a database hosted on the server.

## Table of Contents
- [Installation](#installation)
- [Use](#use)
- [Questions](#questions)
- [License](#license)

## Installation
This is a [Node.js](https://nodejs.org/en) app that uses a [MySQL](https://www.mysql.com) database; both of these must be installed on the host computer. To install this app:

1. Clone or download this repo, open a terminal in the app directory, and type `npm install` to install the dependencies.
2. In MySQL, create a database called `ecommerce_db`.
3. In the root directry create a file `.env` and define the following environmental three environmental variables: `DB_NAME='ecommerce_db'`, `DB_USER='<user>'`, `DB_PASSWORD='<password>'` (with the appropriate values for `<user>` and `<password>` for your MySQL installation).
4. Start the server with the command `npm start`. The app will create four tables in the database: `Category`, `Product`, `ProductTag`, and `Tag`. Examine the code in the `models` directory for the schema of those tables (this app uses the Sequelize ORM).
5. If you wish to test the app with sample data, type `npm run seed.`

## Use
The following 15 routes are defined for performing CRUD operations on the MySQL database using Sequelize:

- `/api/categories`: GET route to list all categories, POST route to add a new category. The POST route expects JSON with a single key, entitled `category_name`.
- `/api/categories/id` (where 'id' is a number): GET, PUT, and DELETE routes to display, update, or delete categories. The PUT route should use JSON with a key/value pair using the `category_name` key. If the ID is invalid (ie, the category does not exist) then the app will return an error message to that effect.
- `/api/tags`: GET route to list all tags, POST route to add a new tag. The POST route expects JSON with a single key, entitled `tag_name`. 
- `/api/tags/id` (where 'id' is a number): GET, PUT, and DELETE routes to display, update, or delete tags. The PUT route should use JSON with a key/value pair using the `tag_name` key. If the ID is invalid (ie, the tag does not exist) then the app will return an error message to that effect.
- `/api/products`: GET route to list all products (with associated category and tag values, if they exist) and a POST route to create a new product. A new product request should pass a JSON with the format shown below with example values. The `category_id` and `stock` properties can be omitted, in which case the corresponding fields will be set to NULL and 10, respectively. `tagIds` *MUST* be passed as an array, even if empty (ie, no tags exist for the product). Category and Tag IDs are validated: if the IDs do not exist, an error message will be returned.
```
{
  "product_name": "Marvin Gaye Box Set",
  "price": 50.00,
  "stock": 3,
  "category_id": 3,
  "tagIds": [2,4,5]
}
```
- `/api/products/id` (where 'id' is a number): GET, PUT, and DELETE routes to display, update, or delete products. Products are displayed with their category and tag names and IDs (if they exist). PUT requests to update a product should follow the same JSON format as shown above. All IDs (Product, Category, and Tags) are validated and an error message is returned if the corresponding IDs are not found in the database.

[This video link](https://youtu.be/x99OsMoR-gw "video demo of app") demonstrates the behavior of the routes using the `Insomnia` app:

<https://youtu.be/x99OsMoR-gw>

## Questions
Reach out if you have questions that are not covered here!

- GitHub username: clstevenson
- email: chrislstevenson@gmail.com

## License
This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/MIT).
