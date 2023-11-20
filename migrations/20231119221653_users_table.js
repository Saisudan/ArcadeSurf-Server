/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.smallint('level').notNullable().unsigned().defaultTo(1);
        table.integer('experience').unsigned();
        table.integer('coins').unsigned();
        table.integer('games_played').unsigned();
        table.integer('games_hosted').unsigned();
        table.string('email').unique();
        table.timestamp('creation_time').defaultTo(knex.fn.now());
        table.timestamp('last_played');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
