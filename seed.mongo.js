//mongo ds139899.mlab.com:39899/league-for-good -u ahstein3521 -p 

var leagueId = db.leagues.find({name: 'NBA'}).toArray()[0]._id;
var now = new Date();
var a = db.seasons.aggregate([

	{ $match: { league_id: leagueId }},
	{ $unwind: '$teams' },
	{ $lookup: { from: 'teams', localField: 'teams', foreignField: '_id', as: 'team' }},
	{ $project: 
		{ 
			seasonInfo: {
				start_date:'$start_date',
				end_date:'$end_date',
				seasonName: {
					$concat: [
						'$name', ' ', { $dateToString: { format: '%Y', date:'$start_date' }}
					]
				}				
			},	
			team: { $arrayElemAt: ['$team', 0]},
			active: {
				$and: [
					{ $gte: [now, '$start_date']},
					{ $lt: [now, '$end_date']}
				]
			}
		}
	},
	{	$group: 
		{
			_id: '$team._id',
			name: { $first: '$team.name' },
			league_id: { $first: 'team.league_id' },
			currently_active: { $first: '$team.currently_active'},
			players: { $first: '$team.players'},
			staff: {$first: '$team.staff'},
			seasons: { $push: '$seasonInfo' },
			activeSeason: { $first: {
				$filter: {
					input: '$seasonInfo',
					as: 'season',
					cond: {
						$eq: ['$$season.active', true]
					}
				}
			}}
		}
	}
]).toArray()


