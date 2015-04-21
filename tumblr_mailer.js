var fs = require('fs');
var ejs = require('ejs');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('DYyv-jfQlNoYKOJu0okUBg');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf-8');
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: 'RCNp0AWuwr1w36cSF1lu72FNh4v0jE6mq8VIfaVuMGinVW2l7G',
  consumer_secret: '1k7W0k2lBfdaZJ76DkjDR1TakW7L01XwzqfPhwGKUp5rXbE8gJ',
  token: '88swWdV4jLSDSGFRjviF0gzOR8UftMW5GOLufy9jaq4tqc1d15',
  token_secret: 'G0lTdrnVrsKaR3J0XIv88HRXvMV99bEs4zheADB4MYG1Sa15ID'
});

var csvParse = function(csv){
	var answer = [];
	var split = csv.split("\n");
	var columns = split.shift().split(",");
	
	split.forEach(function(contact){ 
		var contactProp = contact.split(",");
		var newObj = {};
		for(var k = 0; k < columns.length; k++){			
			newObj[columns[k]] = contactProp[k];
		}
			answer.push(newObj);
		});
	return answer; 

}

client.posts('bneis.tumblr.com', function(err, blog){
	var latestPosts = []; 
	var now = (Math.floor(new Date().getTime() / 1000)); 
	blog.posts.forEach(function(post){
		//if(now - post.timestamp <= 604800){
			latestPosts.push(post);
		//}
	})

	csvData = csvParse(csvFile);

	csvData.forEach(function(row){
		var firstName = row["firstName"];
		var numMonthsSinceContact = row["numMonthsSinceContact"];
		var templateCopy = emailTemplate;
		var customizedTemplate = ejs.render(templateCopy, {firstName: firstName, 
															numMonthsSinceContact: numMonthsSinceContact,
															latestPosts: latestPosts
														});
	
	sendEmail(firstName, row["emailAddress"], "Ben N", "ben@neiswander.com", "testing", customizedTemplate);
	});
});

  function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }


