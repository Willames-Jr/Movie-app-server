const Review = require('../models/Review');
const User = require('../models/User');

module.exports = {
    add: (req,res) => {
        
        const {movie,content} = req.body;
        const {writer} = req.params;
        const payload = req.decoded;
        const review = new Review({movie,content,writer});

        let errors = [];

        if(!movie || !content || !writer){
            errors.push({error: 'Mandatory fields must be filled'});
        }

        if(errors.length > 0){
            res.status(400).send(errors);
            return;
        }

        User.findById({writer}).then((review) => {
            if(!review){
                errors.push({error: 'This user does not exist'});
            }
        }).catch(err => {
            res.status(500).send({error:err});
        })

        if(errors.length > 0){
            res.satus(400).send(errors);
        }

        if (payload.userId = writer) {
            review.save().then(review => {
                res.status(201).send(review);
            }).catch(err => {
                res.send(500).send({error:err});
            });
        } else {
            res.status(401).send({ message: 'You must be logged in' })
        }
    },
    index: (req,res) => {

        const {movie} = req.query;

        if(!movie){
            Review.find()
            .populate('writer', 'name + avatar -_id')
            .then(reviews => {
                res.status(200).send(reviews);
            }).catch(err => {
                res.status(500).send({error: err});
            });
        }else{
            Review.findOne({movie})
            .populate('writer', 'name + avatar -_id')
            .then(reviews => {
                res.status(200).send(reviews);
            }).catch(err => {
                res.status(500).send({error: err});
            });
        }
    },
    update: (req,res) => {

        const {_id} = req.query;
        const {content} = req.body;
        const payload = req.decoded;

        Review.findOne({_id}).then(review => {
            if(review){
                if(payload.userId == review.writer){
                    Review.update({_id},{content}).then(updatedReview => {
                        res.status(200).send(updatedReview);
                    }).catch(err => {
                        res.status(500).send({error: err});
                    });
                }else{
                    res.status(401).send({ error: 'You must be logged in' })
                }
            }else{
                res.status(400).send({error: 'This review does not exist'});
            }
        }).catch(err => {
            res.status(500).send({error:err});
        })
    },
    delete:(req,res) => {
        const {_id} = req.query;
        const payload = req.decoded;

        Review.findOne({_id}).then(review => {
            if(review){
                if(payload.userId == review.writer){
                    Review.deleteOne({_id}).then(() => {
                        res.status(204).send();
                    }).catch(err => {
                        res.status(500).send({error: err});
                    });
                }else{
                    res.status(401).send({ error: 'You must be logged in' })
                }
            }else{
                res.status(200).send({error: 'This review does not exist'});
            }
        }).catch(err => {
            res.status(500).send({error:err});
        })
    }
}