/**
 * @swagger
 *  components :
 *      schemas :
 *          AddPermission :
 *              type : object
 *              required :
 *                  -   name
 *              properties :
 *                  name :
 *                      type : string
 *                      description : add a unique name for permission
 *                  description :
 *                      type : string
 *                      description : add a description for permission
 */

/**
 * @swagger
 *  /permission/add :
 *      post :
 *          tags : [Permission(AdminPanel)]
 *          summary : create permission
 *          requestBody :
 *              required : true
 *              content :
 *                  application/x-www-form-urlencoded :
 *                      schema :
 *                          $ref : '#/components/schemas/AddPermission'
 *                  application/json :
 *                      schema :
 *                          $ref : '#/components/schemas/AddPermission'
 *          responses :
 *              201 :
 *                  description : create - permission created
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : "#/definitions/PermissionDefinition"
 */

/**
 * @swagger
 *  /permission/list :
 *      get :
 *          tags : [Permission(AdminPanel)]
 *          summary : get all permissions
 *          responses :
 *              200 :
 *                  description : success - get list of permissions
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : '#/definitions/PermissionDefinition'
 */

/**
 * @swagger
 *  /permission/remove/{id} :
 *      delete :
 *          tags : [Permission(AdminPanel)]
 *          summary : remove permission with id
 *          parameters :
 *              -   in : path
 *                  name : id
 *                  type : string
 *                  required : true
 *          responses :
 *              200 :
 *                  description : success - permission removed
 *                  content :
 *                      application/json :
 *                          schema :
 *                              $ref : '#/definitions/DeleteAndUpdate'
 */
