/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users_to_lobbies', (table) => {
        table
            .integer('user_id')
            .unsigned()
            .references('users.id')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer('lobby_id')
            .unsigned()
            .references('lobbies.id')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.primary(['user_id', 'lobby_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users_to_lobbies');
};
