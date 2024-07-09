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
        // variables: { userId: 'your_user_id' }
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

app.get('/getUsers',(req,res)=>{
  const data = {
    query: `{ users {
    user_id
    email
    name
    num_transcripts
    recent_meeting
    minutes_consumed
    is_admin
    integrations
  }
 }`
  };
  
  axios
    .post(url, data, { headers: headers })
    .then(response => {
      console.log(response.data);
      res.json(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  
  
        
})

//working
app.get('/getParticularMeet',(req,res)=>{
  const data = {
    query: 'query Transcript($transcriptId: String!) { transcript(id: $transcriptId) { title id } }',
    variables: { transcriptId: 'WoZxrvg7psxur6Fw' }
  };
  
  axios
    .post(url, data, { headers: headers })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });  
})

//working
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

//this is giving an error right now but that is due to we are not yet having the paid subscription so no worries for this
app.get('/getMeets2', (req, res) => {
  const data = {
    query: `
      query Transcripts($userId: String) {
        transcripts(user_id: $userId) {
          id
          sentences {
            index
            speaker_name
            speaker_id
            text
            raw_text
            start_time
            end_time
          }
          title
          host_email
          organizer_email
          calendar_id
          user {
            user_id
            email
            name
            num_transcripts
            recent_meeting
            minutes_consumed
            is_admin
            integrations
          }
          fireflies_users
          participants
          date
          transcript_url
          audio_url
          video_url
          duration
          meeting_attendees {
            displayName
            email
            phoneNumber
            name
            location
          }
          summary {
            action_items
            keywords
            outline
            overview
            shorthand_bullet
          }
        }
      }
    `,
    variables: { userId: req.user_id}// Assuming userId is passed as a query parameter
  };

  axios
    .post(url, data, { headers: headers })
    .then(response => {
      console.log(response.data);
      res.json(response.data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch transcripts' });
    });
});

app.get("/delete",(req,res)=>{
  const data = {
    query: `
        mutation($transcriptId: String!) {
          deleteTranscript(id: $transcriptId) {
            title
            date
            duration
            organizer_email
          }
        }
      `,
    variables: { transcriptId: 'WoZxrvg7psxur6Fw' }
  };
  
  axios
    .post(url, data, { headers: headers })
    .then(result => {
      console.log(result.data);
    })
    .catch(e => {
      console.log(JSON.stringify(e));
    });
  
  
})

//to upload the meeting or some audio: in paid version
app.get("/upload",(req,res)=>{
  const input = {
    url: 'https://www.youtube.com/watch?v=Sc3l3Nf7yJ8',
    title: 'youtube1',
    attendees: [
      {
        displayName: 'User1',
        email: 'notetaker@fireflies.ai',
        phoneNumber: 'xxxxxxxxxxxxxxxx'
      },
      {
        displayName: 'Fireflies Notetaker 2',
        email: 'notetaker2@fireflies.ai',
        phoneNumber: 'xxxxxxxxxxxxxxxx'
      }
    ]
  };
  const data = {
    query: `       mutation($input: AudioUploadInput) {
          uploadAudio(input: $input) {
            success
            title
            message
          }
        }
      `,
    variables: { input }
  };
  
  axios
    .post(url, data, { headers: headers })
    .then(result => {
      console.log(result.data);
    })
    .catch(e => {
      console.log(JSON.stringify(e));
    });
})

app.get("/addLive",(req,res)=>{
  const data = {
    query: `  mutation AddToLiveMeeting($meetingLink: String!) {
          addToLiveMeeting(meeting_link: $meetingLink) {
            success
          }
        }
      `,
    variables: { meetingLink: 'https://meet.google.com/xov-dqie-poi' }
  };
  
  axios
    .post(url, data, { headers: headers })
    .then(result => {
      console.log(result.data);
    })
    .catch(e => {
      console.log(JSON.stringify(e));
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
