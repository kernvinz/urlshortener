/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("url_info"))) {
      await knex.schema.createTable("url_info", (t) => {
        t.increments("id").primary(); // id Int Increment
        t.string("originalUrl").notNullable(); // originalUrl string
        t.string("slug").notNullable().unique(); // slug string unique
        t.date("expiration").nullable(); // expiration date only
        t.timestamps(true, true); // created_at and updated_at with defaults
      });
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("url_info");
  };
  