import React from 'react';
import firebase from 'firebase';
import axios from 'axios';
import JobSearchResults from './JobSearchResults';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";


class JobSaved extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            jobsSaved: [],
            jobsAppliedFor: []
        }

        this.saveJob = this.saveJob.bind(this);
        this.applyForJob = this.applyForJob.bind(this);
    }
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user !== null) {
                this.setState({
                    loggedIn: true,
                    user: user.uid,
                    userName: user.displayName,
                    userPhoto: user.photoURL
                });
                this.dbRef = firebase.database().ref(`users/${this.state.user}`);
                this.dbRef.on("value", snapshot => {
                    if (snapshot.val().jobsSaved) {
                        this.setState({
                            jobsSaved: Object.values(snapshot.val().jobsSaved)
                        });

                        if (snapshot.val().jobsAppliedFor) {
                            this.setState({
                                jobsAppliedFor: Object.values(snapshot.val().jobsAppliedFor)
                            });
                        }
                    } else {
                        this.setState({
                            loggedIn: false
                        });
                    }
                });
            }
        });
    }

    saveJob(jobObject) {
        const jobkey = jobObject.jobkey;
        // get currently saved jobs from state
        let jobsSaved = this.state.jobsSaved;

        // if job has been saved, remove saved job
        if (jobsSaved[jobkey]) {
            delete jobsSaved[jobkey];
        }
        // if job has not been saved, add job to saved jobs
        else {
            jobsSaved[jobkey] = jobObject;
        }
        // set state
        this.setState({
            jobsSaved: jobsSaved
        });

        if (this.state.loggedIn && this.state.user !== null) {
            this.dbRef = firebase
                .database()
                .ref(`users/${this.state.user}/jobsSaved`);
            this.dbRef.set(jobsSaved);
        }
    }

    applyForJob(jobObject) {
        const jobkey = jobObject.jobkey;
        let appliedFor = this.state.jobsAppliedFor;
        appliedFor[jobkey] = jobObject;

        let currentDate = new Date();
        currentDate = currentDate.toString();
        currentDate = currentDate.substring(0, 15);
        appliedFor[jobkey].dateApplied = currentDate;

        let saved = this.state.jobsSaved;
        if (saved[jobkey]) {
            saved[jobkey] = jobObject;
            saved[jobkey].dateApplied = currentDate;
        }

        // update state
        this.setState({
            jobsAppliedFor: appliedFor,
            jobsSaved: saved
        });

      // update database
        if (this.state.loggedIn && this.state.user !== null) {
            this.dbRef = firebase
                .database()
                .ref(`users/${this.state.user}/jobsAppliedFor`);
            this.dbRef.set(appliedFor);
            this.dbRefB = firebase
                .database()
                .ref(`users/${this.state.user}/jobsSaved`);
            this.dbRefB.set(saved);
        }
    }
    render() {
        return (
            <div className="saved-results">
                <Link to="/notes"><img src="/dev/styles/assets/edit-black.svg" alt="add notes" className="notes-button"/></Link>
                {this.state.jobsSaved.map((job) => {
                    return (
                        <JobSearchResults
                            key={`saved-${job.jobkey}`}
                            job={job}
                            loggedIn={this.state.loggedIn}
                            onSave={this.saveJob}
                            onApply={this.applyForJob}
                            saved={null}
                            applied={null}
                        />
                    )
                })}
                         
            </div>
        )
    }
}

export default JobSaved;