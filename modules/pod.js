const tripledoc = require('tripledoc');
const rdfnamespaces = require('rdf-namespaces');

const space = rdfnamespaces.space;
const rdf = rdfnamespaces.rdf;
const solid = rdfnamespaces.solid;
const schema = rdfnamespaces.schema;

async function getWatchedInboxesListDocument(profile) {
    /* 1. Check if a Document tracking our notes already exists. */
    const privateTypeIndexRef = profile.getRef(solid.privateTypeIndex);
    const privateTypeIndex = await tripledoc.fetchDocument(privateTypeIndexRef);
    const watchedInboxesListEntry = privateTypeIndex.findSubject(solid.forClass, schema.URL);

    /* 2. If it doesn't exist, create it. */
    if (watchedInboxesListEntry === null) {
        // We will define this function later:
        return initialiseWatchedInboxesList(profile, privateTypeIndex);
    }

    /* 3. If it does exist, fetch that Document. */
    const notesListRef = watchedInboxesListEntry.getRef(solid.instance);
    return tripledoc.fetchDocument(notesListRef);
}

async function initialiseWatchedInboxesList(profile, typeIndex) {
    // Get the root URL of the user's Pod:
    const storage = profile.getRef(space.storage);

    // Decide at what URL within the user's Pod the new Document should be stored:
    const watchedInboxesListRef = storage + 'private/watchedInboxes.ttl';
    // Create the new Document:
    let watchedInboxes = tripledoc.createDocument(watchedInboxesListRef);
    watchedInboxes = await watchedInboxes.save();

    // Store a reference to that Document in the private Type Index for `schema:TextDigitalDocument`:
    const typeRegistration = typeIndex.addSubject();
    // addRef := subject.addRef(predicate, object)
    typeRegistration.addRef(rdf.type, solid.TypeRegistration); // maps RDF class to its locations using solid.instance
    typeRegistration.addRef(solid.instance, watchedInboxes.asRef());
    typeRegistration.addRef(solid.forClass, schema.URL);
    await typeIndex.save([typeRegistration]);

    // And finally, return our newly created (currently empty) notes Document:
    return watchedInboxes;
}

async function addWatchedInbox(inbox, watchedInboxesListDoc) {
    // Initialise the new Subject:
    const newInbox = watchedInboxesListDoc.addSubject();

    newInbox.addRef(rdf.type, schema.URL);
    newInbox.addString(schema.url, inbox);

    const success = await watchedInboxesListDoc.save([newInbox]);
    return success;
}

async function removeWatchedInbox(inboxIRI, watchedInboxesListDoc) {
    // for some reason, we have to surround the IRI in parenthesis (it is stored as literal object: Literal {id: ""https://nokton.solid.community/inbox/""})
    const watchedInboxSubject = watchedInboxesListDoc.findSubject(schema.url, '"' + inboxIRI + '"');

    watchedInboxesListDoc.removeSubject(watchedInboxSubject.asRef());
    await watchedInboxesListDoc.save();
}

module.exports = {addWatchedInbox, removeWatchedInbox, getWatchedInboxesListDocument, initialiseWatchedInboxesList};