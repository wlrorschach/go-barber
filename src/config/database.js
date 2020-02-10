module.exports = {
  dialect: 'postgres',
  host: 'localhost', // tollbox: 192.168.99.100, docker for windows localhost
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
