const express=require('express')
const app=express();
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Middleware to parse JSON body

//the authorization part for the fireflies.ai account
const url = 'https://api.fireflies.ai/graphql';
const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer 2cafdc53-1e23-4bb9-8725-22366c5c9e46'
};

app.get('/getUser',(req,res)=>{
    const data = {
        query: '{ user { user_id name num_transcripts minutes_consumed recent_transcript recent_meeting  is_admin integrations} }',
        variables: { userId: 'gPpk36y9dQ' }
      };

      axios
      .post(url, data, { headers: headers })
      .then(response => {
        console.log(response.data);
        const userId = response.data.data.user.user_id;
        console.log('Your user_id is:', userId);
        req.user_id=userId;
        res.json(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
          
})

app.get("/getMeets",(req,res)=>{
    const data = {
      query: 'query Transcripts($userId: String) { transcripts(user_id: $userId) { title id } }',
      variables: { userId: req.user_id}
    };
    axios
      .post(url, data, { headers: headers })
      .then(response => {
        console.log(response.data);
        res.json(response.data); 
      })
      .catch(error => {
        console.error(error);
      });
})

// Endpoint to handle incoming webhook notifications
app.post('/webhook', (req, res) => {
  const payload = req.body; // The payload sent by Fireflies.ai

  // Log the received payload
  console.log('Received payload:', payload);

  // Example: Check the event type and handle the event
  if (payload.event === 'transcript_ready') {
    const transcript = payload.transcript; // Extract transcript data
    
    // Example: Update database with the new transcript
    updateDatabase(transcript);

    console.log('New transcript received:', transcript);
    res.status(200).send('Webhook received successfully');
  } else {
    console.log('Unexpected webhook event:', payload.event);
    res.status(400).send('Unexpected webhook event');
  }
});


// app.get("/addMeet/:id",(req,res)=>{
    
//     const data = {
//         query: `  mutation AddToLiveMeeting($meetingLink: String!) {
//                       addToLiveMeeting(meeting_link: $meetingLink) {
//                           success
//                       }
//                   }
//           `,
//         variables: { meetingLink:{id} }

//       };
      
//       axios
//         .post(url, data, { headers: headers })
//         .then(result => {
//           console.log(result.data);
//         })
//         .catch(e => {
//           console.log(JSON.stringify(e));
//         });
// })

  app.listen(3000,()=>{
    console.log("server at port 3000");
  })
