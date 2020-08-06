module.exports = {
    'Login': function (client) {
        const loginButton = '#login';
        client
            .url('localhost:3000')
            .waitForElementVisible('body', 1000)
            .click(loginButton);

        // Switch to pop-up window
        client.windowHandles(function (result) {
            // 0 == current main window, 1 == new one
            var handle = result.value[1];
            client.switchWindow(handle);
        });

        client
            .click('button.idp')
            .pause(3000)
            .setValue('#username', 'test-user')
            .setValue('#password', 'SolidCommunity@2020')
            .waitForElementVisible('#login')
            .click('#login')
            .pause(3000);

        // Switch back to main window
        client.windowHandles(function (result) {
            // 0 == current main window, 1 == new one
            var handle = result.value[0];
            client.switchWindow(handle);
        });

        client
            .waitForElementVisible('h2')
            .assert.containsText('h2', "monitored inboxes");

        client.waitForElementVisible('#resourceIri')
        client.end()
    }
}