const express = require('express');
const { connectToDatabase } = require('../lib/mongodb');

const router = express.Router();

router.post('/getInteraction', async (req, res, next) => {
  if (req.method === 'POST') {
    console.log('In POST API ROUTE');
    const { db } = await connectToDatabase();
    const drugList = req.body.drugList || [];

    const interactionsList = [];
    for (let i = 0; i < drugList.length; i++) {
      for (let j = 0; j < drugList.length; j++) {
        const interaction = await db
          .collection('interactions')
          .find({ Drug_A: drugList[i].name, Drug_B: drugList[j].name })
          .toArray();
        console.log('interaction = ', interaction);
        console.log('drugList[i] = ', drugList[i]);
        console.log('drugList[j] = ', drugList[j]);
        if (interaction.length !== 0) {
          interactionsList.push(interaction[0]);
        }
      }
    }

    const level_to_int = {
      Major: 0,
      Moderate: 1,
      Minor: 2,
      Unknown: 3,
    };

    interactionsList.sort(
      (a, b) => level_to_int[a.Level] - level_to_int[b.Level]
    );

    console.log('interactionsList = ', interactionsList);

    if (interactionsList.length === 0) {
      return res
        .status(200)
        .json({ interactions: [], message: 'No interactions found' });
    }

    return res.status(200).json({ interactions: interactionsList });
  }

  return res.status(400).json({ message: 'This route is not defined' });
});

router.post('/getSimilarDrugs', async (req, res, next) => {

    console.log('In POST API ROUTE', req.body);
    const { db } = await connectToDatabase();
    const drugName = req.body.drugName;
    console.log('Drug Name: ', drugName);
    const similarDrugs = await db
      .collection('interactions')
      .aggregate([
        {
          $match: {
            $or: [{ Drug_A: { $regex: `^${drugName}`, $options: 'i' } }],
          },
        },
        { $group: { _id: { Drug_A: '$Drug_A', Drug_B: '$Drug_B' } } },
        { $limit: 5 },
        { $project: { _id: 0, Drug_A: '$_id.Drug_A', Drug_B: '$_id.Drug_B' } },
        { $group: { _id: null, similarDrugs: { $addToSet: '$Drug_A' } } },
        { $project: { _id: 0, similarDrugs: 1 } },
      ])
      .toArray();

    return res.status(200).json({ similarDrugs: similarDrugs });
});

module.exports = router;