module.exports = (sequelize, Sequelize) => {
    const Berita = sequelize.define("berita", {
        judul: {
            type: Sequelize.STRING
        },
        image: {
            type: Sequelize.STRING
        },
        artikel: {
            type: Sequelize.STRING
        }
        
        // ,
        // created: {
        //     type: Sequelize.DATE

        // }
    });

    return Berita;
};