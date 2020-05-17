import { Fragment as OldFragment, IFragment as IOldFragment } from "../database_old/schemas/fragment.schema";
import { Source, Word, Fragment } from "../database/schemas";
import { Mongoose, Types } from "mongoose";

class ImportService {

	public import() {
		let fragments = OldFragment.find({ 'wordCount' : 1 }).then(async function(items : IOldFragment[]){
			// Check for each item if the source has been added to the database
			console.log("Processing: " + items.length);

			for(let item of items){

				let source = await Source.findOne({ 'id' : item.id, 'origin' : 'YouTube' });

				if( source == null ){
					source = await Source.create({'id' : item.id, 'origin' : 'YouTube', 'createdAt' : new Date()});
				}

				let word = await Word.findOne({ 'text' : item.phrase });

				if (word == null) {
					word = await Word.create({ 'text' : item.phrase });
				}
				
				// Check if fragment exists

				let frag = await Fragment.findOne(
					{ 
						'source' :  source._id,
						'word' : word._id,
						'start' : item.start.toString(),
						'end' : item.end.toString()
					}
				)

				if(frag == null) {
					Fragment.create({
						'source' :  source._id,
						'word' : word._id,
						'createdBy' : Types.ObjectId('5a5d2e7e11b60915ad03251f'),
						'start' : item.start.toString(),
						'end' : item.end.toString()
					})
				}

			}

		});
	}
}


export default new ImportService();