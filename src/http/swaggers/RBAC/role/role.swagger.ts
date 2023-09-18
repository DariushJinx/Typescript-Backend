/**
 * @swagger
 *  components :
 *      schemas :
 *          CreateRole :
 *              type : object
 *              required :
 *                  -   title
 *                  -   description
 *              properties :
 *                  title :
 *                      type : string
 *                      description : the title of role
 *                  description :
 *                      type : string
 *                      description : the description of role
 *                  permissions :
 *                      type : array
 *                      description : the permission id for role
 */

/**
 * @swagger
 *  /role/add :
 *      post :
 *          tags : [Roles(AdminPanel)]
 *          summary : create new role
 *          requestBody :
 *              required : true
 *              content :
 *                  application/x-www-form-urlencoded :
 *                      schema :
 *                          $ref : '#/components/schemas/CreateRole'
 *                  application/json :
 *                      schema :
 *                          $ref : '#/components/schemas/CreateRole'
 *          responses :
 *              201 :
 *                  description : create - role created
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : '#/definitions/Create'
 */

/**
 * @swagger
 *  /role/list :
 *      get :
 *          tags : [Roles(AdminPanel)]
 *          summary : get all roles
 *          responses :
 *              200 :
 *                  description : success - all routes catches
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : '#/definitions/Create'
 */

/**
 * @swagger
 *  /role/remove/{field} :
 *      delete :
 *          tags : [Roles(AdminPanel)]
 *          summary : remove role with id
 *          parameters :
 *              -   in : path
 *                  name : field
 *                  type : string
 *                  required : true
 *          responses :
 *              200 :
 *                  description : success - role removed
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : '#/definitions/DeleteAndUpdate'
 */
