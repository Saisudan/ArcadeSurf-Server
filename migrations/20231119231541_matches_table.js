/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('matches', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.smallint('rounds').notNullable().unsigned();
        table.smallint('min_players').notNullable().unsigned();
        table.smallint('max_players').notNullable().unsigned();
        table.smallint('experience').notNullable().unsigned();
        table.smallint('coins').notNullable().unsigned();
        table.check('?? >= ??', ['max_players', 'min_players']);
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('matches');
};
