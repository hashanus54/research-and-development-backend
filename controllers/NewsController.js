const NewsSchema = require('../schemas/NewsSchema');

const createNews = async (req, res) => {
    try {
        const { imageUrl, title, subTitle } = req.body;
        const userId = req.user.id;

        const newNews = new NewsSchema({
            user: userId,
            imageUrl,
            title,
            subTitle,
            activeState: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newNews.save();

        return res.status(201).json({
            status: true,
            message: 'News created successfully',
            data: newNews
        });

    } catch (error) {
        console.error('Error creating news:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

const getAllNews = async (req, res) => {
    try {
        const news = await NewsSchema.find({ activeState: true })
            .sort({ createdAt: -1 })
            .limit(6);

        return res.status(200).json({
            status: true,
            message: 'News retrieved successfully',
            data: news
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

const getNewsById = async (req, res) => {
    const {id} = req.params;

    NewsSchema.findById({_id: id}).then(result => {
        if (result == null) {
            res.status(200).json({
                status: false,
                message: 'News Not Found',
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'News',
                data: result
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    })
};

const deleteNews = async (req, res) => {

    const {id} = req.params;
    NewsSchema.deleteOne({_id: id}).then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json({
                status: true,
                message: 'News deleted successfully.'
            });
        } else {
            res.status(500).json({
                status: false,
                message: 'Error deleting News'
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    });
};

module.exports = {
    createNews,
    getAllNews,
    getNewsById,
    deleteNews,
};