const tripledoc = require('tripledoc');
const rdfnamespaces = require('rdf-namespaces');

const space = rdfnamespaces.space;
const rdf = rdfnamespaces.rdf;
const solid = rdfnamespaces.solid;
const schema = rdfnamespaces.schema;

async function getNotesList(profile) {
    /* 1. Check if a Document tracking our notes already exists. */
    const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
    const publicTypeIndex = await tripledoc.fetchDocument(publicTypeIndexRef);
    const notesListEntry = publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);

    /* 2. If it doesn't exist, create it. */
    if (notesListEntry === null) {
        // We will define this function later:
        return initialiseNotesList(profile, publicTypeIndex);
    }

    /* 3. If it does exist, fetch that Document. */
    const notesListRef = notesListEntry.getRef(solid.instance);
    return await tripledoc.fetchDocument(notesListRef);
}

async function initialiseNotesList(profile, typeIndex) {
    // Get the root URL of the user's Pod:
    const storage = profile.getRef(space.storage);

    // Decide at what URL within the user's Pod the new Document should be stored:
    const notesListRef = storage + 'public/notes.ttl';
    // Create the new Document:
    const notesList = tripledoc.createDocument(notesListRef);
    await notesList.save();

    // Store a reference to that Document in the public Type Index for `schema:TextDigitalDocument`:
    const typeRegistration = typeIndex.addSubject();
    typeRegistration.addRef(rdf.type, solid.TypeRegistration);
    typeRegistration.addRef(solid.instance, notesList.asRef());
    typeRegistration.addRef(solid.forClass, schema.TextDigitalDocument);
    await typeIndex.save([typeRegistration]);

    // And finally, return our newly created (currently empty) notes Document:
    return notesList;
}


async function addNote(note, notesList) {
    // Initialise the new Subject:
    const newNote = notesList.addSubject();

    // Indicate that the Subject is a schema:TextDigitalDocument:
    newNote.addRef(rdf.type, schema.TextDigitalDocument);

    // Set the Subject's `schema:text` to the actual note contents:
    newNote.addString(schema.text, note);

    // Store the date the note was created (i.e. now):
    newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

    const success = await notesList.save([newNote]);
    return success;
}

module.exports = {addNote, getNotesList, initialiseNotesList};