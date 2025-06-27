// fitness.js
const fitness = [
    {
        name: "FULL BODY",
        category: "cardio",
        image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrEM-6gDUO7g1cdrNhBaqk_0nwxy6ILlIqsQ&usqp=CAU",
        days:
            [
                {
                    "id": "Day 1",
                    "name": "Day 1 - Foundation",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex1",
                            "name": "Jumping Jacks",
                            "sets": 1,
                            type: "time",
                            "duration": 30,
                            "image": "https://sworkit.com/wp-content/uploads/2020/06/sworkit-jumping-jack.gif"
                        },
                        {
                            "id": "ex2",
                            "name": "Knee Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex3",
                            "name": "Bodyweight Squats",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/resistance-band-bent-over-row.jpg"
                        },
                        {
                            "id": "ex4",
                            "name": "Plank",
                            "sets": 3,
                            type: "time",
                            "duration": 20,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/plank-kids.jpg"
                        },
                        {
                            "id": "ex5",
                            "name": "Glute Bridges",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/glute-bridge.jpg"
                        },
                        {
                            "id": "ex6",
                            "name": "Standing Shoulder Press (Light Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex7",
                            "name": "Bent-Over Rows (Bands)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-bent-over-row.jpg"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex8",
                            "name": "Calf Raises",
                            "sets": 3,
                            "reps": 15,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/calf-raise.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 2",
                    "name": "Day 2 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "High Knees",
                            "sets": 1,
                            "reps": 40,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/high-knee.jpg"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex10",
                            "name": "Incline Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex11",
                            "name": "Lunges",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/lunge.jpg"
                        },
                        {
                            "id": "ex12",
                            "name": "Side Plank",
                            "sets": 3,
                            "duration": "15s",
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/side-plank.jpg"
                        },
                        {
                            "id": "ex13",
                            "name": "Superman",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/superman.jpg"
                        },
                        {
                            "id": "ex14",
                            "name": "Dumbbell Curls (Light)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex15",
                            "name": "Tricep Dips",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/tricep-dip.jpg"
                        },
                        {
                            "id": "ex16",
                            "name": "Step-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/step-up.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 3",
                    "name": "Day 3 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Mountain Climbers",
                            "sets": 1,
                            "reps": 20,
                            "image": "https://i.pinimg.com/originals/18/27/be/1827be178c019b1dc6f8a8d8b4a7b0b8.gif"
                        },
                        {},
                        {},

                        {
                            "id": "ex18",
                            "name": "Wide Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex19",
                            "name": "Bulgarian Split Squats",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/squat.jpg"
                        },
                        {
                            "id": "ex20",
                            "name": "Russian Twists",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-russian-twist.jpg"
                        },
                        {
                            "id": "ex21",
                            "name": "Hip Thrusts",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jumping-plank.jpg"
                        },
                        {
                            "id": "ex22",
                            "name": "Lateral Raises (Light Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/resistance-band-lateral-side-raise.jpg"
                        },
                        {
                            "id": "ex23",
                            "name": "Seated Rows (Bands)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/back-arm-rowing.jpg"
                        },
                        {
                            "id": "ex24",
                            "name": "Jump Rope (Simulated)",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jump-rope-high-knees.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 4",
                    "name": "Day 4 - Active Recovery",
                    "isRestDay": true,
                    "exercises": [
                        {
                            "id": "ex25",
                            type: "time",
                            "duration": 30,
                            "name": "Yoga/Stretching",

                        }
                    ]
                },
                {
                    "id": "Day 5",
                    "name": "Day 5 - Intensity Boost",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex26",
                            "name": "Burpees",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex27",
                            "name": "Diamond Push-Ups",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://thumbs.gfycat.com/MisguidedAridAlaskanmalamute-max-1mb.gif"
                        },
                        {
                            "id": "ex28",
                            "name": "Jump Squats",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jump-squat.gif"
                        },
                        {
                            "id": "ex29",
                            "name": "Bicycle Crunches",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/bicycle-crunch.gif"
                        },
                        {
                            "id": "ex30",
                            "name": "Single-Leg Deadlifts",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/single-leg-deadlift.gif"
                        },
                        {
                            "id": "ex31",
                            "name": "Bicep Curls",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex32",
                            "name": "Skull Crushers (Light Dumbbells)",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://thumbs.gfycat.com/CompleteZigzagFossa-max-1mb.gif"
                        },
                        {
                            "id": "ex33",
                            "name": "Box Jumps",
                            "sets": 3,
                            "reps": 6,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/box-jump.gif"
                        }
                    ]
                },
                {
                    "id": "day6",
                    "name": "Day 6 - Volume Boost",
                    "sets": 4,
                    "exercises": [
                        {
                            "id": "ex34",
                            "name": "Standard Push-Ups",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/push-up.jpg"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex35",
                            "name": "Goblet Squats",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/goblet-squat.gif"
                        },
                        {
                            "id": "ex36",
                            "name": "Plank Shoulder Taps",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/plank-knee-tuck.jpg"
                        },
                        {
                            "id": "ex37",
                            "name": "Reverse Lunges",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/reverse-v-lunge.jpg"
                        },
                        {
                            "id": "ex38",
                            "name": "Bent-Over Rows",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-bent-over-row.jpg"
                        },
                        {
                            "id": "ex39",
                            "name": "Bicycle Crunches",
                            "sets": 4,
                            "reps": 15,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/bicycle-crunches-kids.jpg"
                        },
                        {
                            "id": "ex40",
                            "name": "Tricep Dips",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/tricep-dip.jpg"
                        },
                        {
                            "id": "ex41",
                            "name": "Calf Raises",
                            "sets": 4,
                            "reps": 20,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/calf-raise.jpgf"
                        }
                    ]
                },
                {
                    "id": "Day 7",
                    "name": "Day 7 - Foundation",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex1",
                            "name": "Jumping Jacks",
                            "sets": 1,
                            type: "time",
                            "duration": 30,
                            "image": "https://sworkit.com/wp-content/uploads/2020/06/sworkit-jumping-jack.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex2",
                            "name": "Knee Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex3",
                            "name": "Bodyweight Squats",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/resistance-band-bent-over-row.jpg"
                        },
                        {
                            "id": "ex4",
                            "name": "Plank",
                            "sets": 3,
                            type: "time",
                            "duration": 20,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/plank-kids.jpg"
                        },
                        {
                            "id": "ex5",
                            "name": "Glute Bridges",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/glute-bridge.jpg"
                        },
                        {
                            "id": "ex6",
                            "name": "Standing Shoulder Press (Light Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex7",
                            "name": "Bent-Over Rows (Bands)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-bent-over-row.jpg"
                        },
                        {
                            "id": "ex8",
                            "name": "Calf Raises",
                            "sets": 3,
                            "reps": 15,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/calf-raise.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 8",
                    "name": "Day 8 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "High Knees",
                            "sets": 1,
                            "reps": 40,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/high-knee.jpg"
                        },

                    ]
                },
                {
                    "id": "Day 9",
                    "name": "Day 9 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Mountain Climbers",
                            "sets": 1,
                            "reps": 20,
                            "image": "https://i.pinimg.com/originals/18/27/be/1827be178c019b1dc6f8a8d8b4a7b0b8.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex18",
                            "name": "Wide Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex19",
                            "name": "Bulgarian Split Squats",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/squat.jpg"
                        },
                        {
                            "id": "ex20",
                            "name": "Russian Twists",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-russian-twist.jpg"
                        },
                        {
                            "id": "ex21",
                            "name": "Hip Thrusts",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jumping-plank.jpg"
                        },
                        {
                            "id": "ex22",
                            "name": "Lateral Raises (Light Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/resistance-band-lateral-side-raise.jpg"
                        },
                        {
                            "id": "ex23",
                            "name": "Seated Rows (Bands)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/back-arm-rowing.jpg"
                        },
                        {
                            "id": "ex24",
                            "name": "Jump Rope (Simulated)",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jump-rope-high-knees.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 10",
                    "name": "Day 10 - Active Recovery",
                    "isRestDay": true,
                    "exercises": [
                        {
                            "id": "ex25",
                            type: "time",
                            "duration": 30,
                            "name": "Yoga/Stretching",

                        },
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                    ]
                },
                {
                    "id": "Day 11",
                    "name": "Day 11 - Intensity Boost",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex26",
                            "name": "Burpees",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex27",
                            "name": "Diamond Push-Ups",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://thumbs.gfycat.com/MisguidedAridAlaskanmalamute-max-1mb.gif"
                        },
                        {
                            "id": "ex28",
                            "name": "Jump Squats",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jump-squat.gif"
                        },
                        {
                            "id": "ex29",
                            "name": "Bicycle Crunches",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/bicycle-crunch.gif"
                        },
                        {
                            "id": "ex30",
                            "name": "Single-Leg Deadlifts",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/single-leg-deadlift.gif"
                        },
                        {
                            "id": "ex31",
                            "name": "Bicep Curls",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex32",
                            "name": "Skull Crushers (Light Dumbbells)",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://thumbs.gfycat.com/CompleteZigzagFossa-max-1mb.gif"
                        },
                        {
                            "id": "ex33",
                            "name": "Box Jumps",
                            "sets": 3,
                            "reps": 6,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/box-jump.gif"
                        }
                    ]
                },
                {
                    "id": "day 12",
                    "name": "Day 12 - Volume Boost",
                    "sets": 4,
                    "exercises": [
                        {
                            "id": "ex34",
                            "name": "Standard Push-Ups",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/push-up.jpg"
                        },
                    ]
                },
                {
                    "id": "Day 13",
                    "name": "Day 13 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "High Knees",
                            "sets": 1,
                            "reps": 40,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/high-knee.jpg"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex10",
                            "name": "Incline Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex11",
                            "name": "Lunges",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/lunge.jpg"
                        },
                        {
                            "id": "ex12",
                            "name": "Side Plank",
                            "sets": 3,
                            "duration": "15s",
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/side-plank.jpg"
                        },
                        {
                            "id": "ex13",
                            "name": "Superman",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/superman.jpg"
                        },
                        {
                            "id": "ex14",
                            "name": "Dumbbell Curls (Light)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://i.pinimg.com/originals/8c/53/27/8c532774e4e1c524576bf1fb829ad895.gif"
                        },
                        {
                            "id": "ex15",
                            "name": "Tricep Dips",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/tricep-dip.jpg"
                        },
                        {
                            "id": "ex16",
                            "name": "Step-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/step-up.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 14",
                    "name": "Day 14 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Mountain Climbers",
                            "sets": 1,
                            "reps": 20,
                            "image": "https://i.pinimg.com/originals/18/27/be/1827be178c019b1dc6f8a8d8b4a7b0b8.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex18",
                            "name": "Wide Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif"
                        },
                        {
                            "id": "ex19",
                            "name": "Bulgarian Split Squats",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/squat.jpg"
                        },
                        {
                            "id": "ex20",
                            "name": "Russian Twists",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/dumbbell-russian-twist.jpg"
                        },
                        {
                            "id": "ex21",
                            "name": "Hip Thrusts",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jumping-plank.jpg"
                        },
                        {
                            "id": "ex22",
                            "name": "Lateral Raises (Light Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/resistance-band-lateral-side-raise.jpg"
                        },
                        {
                            "id": "ex23",
                            "name": "Seated Rows (Bands)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/back-arm-rowing.jpg"
                        },
                        {
                            "id": "ex24",
                            "name": "Jump Rope (Simulated)",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://storage.googleapis.com/sworkit-assets/images/exercises/standard/middle-frame/jump-rope-high-knees.jpg"
                        }
                    ]
                },
                {
                    "id": "Day 15",
                    "name": "Day 15 - Active Recovery",
                    "isRestDay": true,
                    "exercises": [
                        {
                            "id": "ex25",
                            type: "time",
                            "duration": 30,
                            "name": "Yoga/Stretching",

                        },
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                    ]
                },
            ],
    },
    {
        "name": "ABS WORKOUT",
        category: "waist",
        "image": "https://miro.medium.com/v2/resize:fit:1400/1*6KmBAkdIRmPB91Q9QVBZ2w.jpeg",
        "days": [
            {
                "id": "Day 1",
                "name": "Day 1 - Core Activation",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Plank (Forearm)",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/forearm-plank.gif"
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Dead Bug",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dead-bug.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Bicycle Crunches",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bicycle-crunch.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Leg Raises",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 2",
                "name": "Day 2 - Oblique Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex5",
                        "name": "Russian Twists",
                        "sets": 3,
                        "reps": 20,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/russian-twist.gif"
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {
                        "id": "ex6",
                        "name": "Side Plank (Each Side)",
                        "sets": 3,
                        "duration": "20s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/side-plank.gif"
                    },
                    {
                        "id": "ex7",
                        "name": "Standing Cable Woodchoppers",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-woodchopper.gif"
                    },
                    {
                        "id": "ex8",
                        "name": "Hanging Knee Raises",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hanging-knee-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 3",
                "name": "Day 3 - Lower Abs & Stability",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex9",
                        "name": "Reverse Crunches",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-crunch.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex10",
                        "name": "Flutter Kicks",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/flutter-kicks.gif"
                    },
                    {
                        "id": "ex11",
                        "name": "L-Sit Hold",
                        "sets": 3,
                        "duration": "15s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/l-sit.gif"
                    },
                    {
                        "id": "ex12",
                        "name": "Scissor Kicks",
                        "sets": 3,
                        "reps": 20,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/scissor-kicks.gif"
                    }
                ]
            },
            {
                "id": "Day 4",
                "name": "Day 4 - Active Recovery (Mobility)",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex13",
                        "name": "Cat-Cow Stretch",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cat-cow.gif"
                    },

                ]
            },
            {
                "id": "Day 5",
                "name": "Day 5 - Power & Endurance",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex16",
                        "name": "Hanging Leg Raises",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hanging-leg-raise.gif"
                    },
                    {
                        "id": "ex17",
                        "name": "Ab Wheel Rollouts",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/ab-wheel-rollout.gif"
                    },
                    {
                        "id": "ex18",
                        "name": "Mountain Climbers",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/mountain-climber.gif"
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {
                        "id": "ex19",
                        "name": "Dragon Flags (Progressions)",
                        "sets": 3,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dragon-flag.gif"
                    }
                ]
            },
            {
                "id": "Day 6",
                "name": "Day 6 - Full Core Circuit",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex20",
                        "name": "Plank to Push-Up",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/plank-to-push-up.gif"
                    },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {},
                    {
                        "id": "ex21",
                        "name": "Side Plank with Hip Dip",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/side-plank-hip-dip.gif"
                    },
                    {
                        "id": "ex22",
                        "name": "V-Ups",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/v-up.gif"
                    },
                    {
                        "id": "ex23",
                        "name": "Cable Crunches",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-crunch.gif"
                    }
                ]
            },
            {
                "id": "Day 7",
                "name": "Day 7 - Advanced Core Burnout",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex24",
                        "name": "Toes-to-Bar",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/toes-to-bar.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex25",
                        "name": "Weighted Sit-Ups",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/weighted-sit-up.gif"
                    },
                    {
                        "id": "ex26",
                        "name": "Hollow Body Hold",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hollow-body-hold.gif"
                    },
                    {
                        "id": "ex27",
                        "name": "Windshield Wipers",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/windshield-wipers.gif"
                    }
                ]
            },
            {
                "id": "Day 8",
                "name": "Day 8 - Resistance Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex28",
                        "name": "Cable Woodchoppers (High to Low)",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-woodchopper.gif"
                    },

                ]
            },
            {
                "id": "Day 9",
                "name": "Day 9 - Bodyweight Challenge",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex32",
                        "name": "Spiderman Plank",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/spiderman-plank.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex33",
                        "name": "Burpees with Push-Up",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/burpee.gif"
                    },
                    {
                        "id": "ex34",
                        "name": "L-Sit to Tuck Hold",
                        "sets": 3,
                        "duration": "20s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/l-sit.gif"
                    },
                    {
                        "id": "ex35",
                        "name": "BOSU Ball Crunches",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/bosu-ball-crunch.gif"
                    }
                ]
            },
            {
                "id": "Day 10",
                "name": "Day 10 - Core Finisher",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex36",
                        "name": "Plank Jacks",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/plank-jack.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex37",
                        "name": "Russian Twist with Medicine Ball",
                        "sets": 3,
                        "reps": 20,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/russian-twist.gif"
                    },
                    {
                        "id": "ex38",
                        "name": "Hanging Windshield Wipers",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hanging-windshield-wipers.gif"
                    },
                    {
                        "id": "ex39",
                        "name": "Bicycle Crunches (Slow Tempo)",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bicycle-crunch.gif"
                    }
                ]
            },
            {
                "id": "Day 11",
                "name": "Day 11 - Active Recovery (Mobility)",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex13",
                        "name": "Cat-Cow Stretch",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cat-cow.gif"
                    },
                    {
                        "id": "ex14",
                        "name": "Seated Spinal Twist",
                        "sets": 3,
                        "duration": "20s/side",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-twist.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex15",
                        "name": "Bird Dog",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bird-dog.gif"
                    }
                ]
            },
            {
                "id": "Day 12",
                "name": "Day 12 - Power & Endurance",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex16",
                        "name": "Hanging Leg Raises",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hanging-leg-raise.gif"
                    },

                ]
            },
            {
                "id": "Day 13",
                "name": "Day 13 - Full Core Circuit",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex20",
                        "name": "Plank to Push-Up",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/plank-to-push-up.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex21",
                        "name": "Side Plank with Hip Dip",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/side-plank-hip-dip.gif"
                    },
                    {
                        "id": "ex22",
                        "name": "V-Ups",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/v-up.gif"
                    },
                    {
                        "id": "ex23",
                        "name": "Cable Crunches",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-crunch.gif"
                    }
                ]
            },
            {
                "id": "Day 14",
                "name": "Day 14 - Advanced Core Burnout",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex24",
                        "name": "Toes-to-Bar",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/toes-to-bar.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex25",
                        "name": "Weighted Sit-Ups",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/weighted-sit-up.gif"
                    },
                    {
                        "id": "ex26",
                        "name": "Hollow Body Hold",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hollow-body-hold.gif"
                    },
                    {
                        "id": "ex27",
                        "name": "Windshield Wipers",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/windshield-wipers.gif"
                    }
                ]
            },
            {
                "id": "Day 15",
                "name": "Day 15 - Resistance Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex28",
                        "name": "Cable Woodchoppers (High to Low)",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-woodchopper.gif"
                    },
                    {
                        "id": "ex29",
                        "name": "Landmine 180s",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/landmine-180.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex30",
                        "name": "Weighted Plank",
                        "sets": 3,
                        "duration": "30s",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/weighted-plank.gif"
                    },
                    {
                        "id": "ex31",
                        "name": "Medicine Ball Slams",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/medicine-ball-slam.gif"
                    }
                ]
            },
        ]
    },
    {
        name: "CHEST WORKOUT",
        category: "chest",
        image:
            "https://images.pexels.com/photos/5327553/pexels-photo-5327553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        days:
            [
                {
                    "id": "Day 1",
                    "name": "Day 1 - Foundation",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex1",
                            "name": "Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/05/push-ups.gif"
                        },
                        {
                            "id": "ex2",
                            "name": "Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-pushup.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex3",
                            "name": "Wide Grip Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/wide-push-up.gif"
                        },
                        {
                            "id": "ex4",
                            "name": "Chest Dips",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-dips.gif"
                        },
                        {
                            "id": "ex5",
                            "name": "Incline Dumbbell Press",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex6",
                            "name": "Decline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-push-up.gif"
                        },
                        {
                            "id": "ex7",
                            "name": "Resistance Band Chest Press",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/band-chest-press.gif"
                        },
                        {
                            "id": "ex8",
                            "name": "Chest Fly (Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/chest-fly.gif"
                        }
                    ]

                },
                {
                    "id": "Day 2",
                    "name": "Day 2 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "Plyometric Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/plyo-push-up.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex10",
                            "name": "Clap Push-Ups",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/clap-push-up.gif"
                        },
                        {
                            "id": "ex11",
                            "name": "Incline Chest Fly (Dumbbells)",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/incline-chest-fly.gif"
                        },
                        {
                            "id": "ex12",
                            "name": "Resistance Band Chest Fly",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-chest-fly.gif"
                        },
                        {
                            "id": "ex13",
                            "name": "Push-Up Hold",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/push-up-hold.gif"
                        },
                        {
                            "id": "ex14",
                            "name": "Explosive Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/explosive-pushup.gif"
                        },
                        {
                            "id": "ex15",
                            "name": "Push-Up to Side Plank",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/pushup-to-side-plank.gif"
                        },
                        {
                            "id": "ex16",
                            "name": "Chest Press with Resistance Band",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-chest-press.gif"
                        }
                    ]

                },
                {
                    "id": "Day 3",
                    "name": "Day 3 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Weighted Push-Ups",
                            "sets": 4,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/03/weighted-pushup.gif"
                        },
                        {
                            "id": "ex18",
                            "name": "Dumbbell Bench Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/dumbbell-bench-press.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex19",
                            "name": "Cable Chest Fly (Alt: Band Fly)",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/cable-chest-fly.gif"
                        },
                        {
                            "id": "ex20",
                            "name": "Incline Dumbbell Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex21",
                            "name": "Slow Negative Push-Ups",
                            "sets": 3,
                            "reps": 6,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/negative-pushup.gif"
                        },
                        {
                            "id": "ex22",
                            "name": "Isometric Chest Squeeze",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-squeeze.gif"
                        },
                        {
                            "id": "ex23",
                            "name": "Decline Dumbbell Press",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-dumbbell-bench-press.gif"
                        }
                    ]

                },
                {
                    "id": "Day 4",
                    "name": "Day 4 - Active Recovery",
                    "isRestDay": true,
                    "exercises": [
                        {
                            "id": "ex24",
                            "name": "Plyo Push-Ups on Elevated Surface",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/elevated-plyo-pushup.gif"
                        },

                    ]

                },
                {
                    "id": "Day 5",
                    "name": "Day 5 - Intensity Boost",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex31",
                            "name": "Incline Chest Press Machine or Dumbbells",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex32",
                            "name": "Flat Bench Chest Fly",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/chest-fly.gif"
                        },
                        {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex33",
                            "name": "Push-Up to Failure",
                            "sets": 2,
                            "reps": "To Failure",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/push-ups.gif"
                        },
                        {
                            "id": "ex34",
                            "name": "Crossbody Cable Chest Fly (or Band)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/crossbody-cable-chest-fly.gif"
                        },
                        {
                            "id": "ex35",
                            "name": "Incline Dumbbell Fly",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/incline-chest-fly.gif"
                        }
                    ]

                },
                {
                    "id": "day6",
                    "name": "Day 6 - Volume Boost",
                    "sets": 4,
                    "exercises": [
                        {
                            "id": "ex36",
                            "name": "Close Grip Push-Ups",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/close-grip-pushup.gif"
                        },
                        {
                            "id": "ex37",
                            "name": "Band Chest Fly (High to Low)",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-high-to-low-fly.gif"
                        },
                        {
                            "id": "ex38",
                            "name": "Archer Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/archer-push-up.gif"
                        },
                        {},
                        {},
                        {}, {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex39",
                            "name": "Push-Up Hold to Failure",
                            "sets": 2,
                            "duration": "Max Hold",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/push-up-hold.gif"
                        },
                        {
                            "id": "ex40",
                            "name": "Decline Push-Ups",
                            "sets": 3,
                            "reps": 15,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-push-up.gif"
                        }
                    ]

                },
                {
                    "id": "Day 7",
                    "name": "Day 7 - Foundation",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex1",
                            "name": "Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/05/push-ups.gif"
                        },
                        {
                            "id": "ex2",
                            "name": "Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-pushup.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex3",
                            "name": "Wide Grip Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/wide-push-up.gif"
                        },
                        {
                            "id": "ex4",
                            "name": "Chest Dips",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-dips.gif"
                        },
                        {
                            "id": "ex5",
                            "name": "Incline Dumbbell Press",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex6",
                            "name": "Decline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-push-up.gif"
                        },
                        {
                            "id": "ex7",
                            "name": "Resistance Band Chest Press",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/band-chest-press.gif"
                        },
                        {
                            "id": "ex8",
                            "name": "Chest Fly (Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/chest-fly.gif"
                        }
                    ]

                },
                {
                    "id": "Day 8",
                    "name": "Day 8 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "Plyometric Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/plyo-push-up.gif"
                        },

                    ]

                },
                {
                    "id": "Day 9",
                    "name": "Day 9 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Weighted Push-Ups",
                            "sets": 4,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/03/weighted-pushup.gif"
                        },
                        {
                            "id": "ex18",
                            "name": "Dumbbell Bench Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/dumbbell-bench-press.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex19",
                            "name": "Cable Chest Fly (Alt: Band Fly)",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/cable-chest-fly.gif"
                        },
                        {
                            "id": "ex20",
                            "name": "Incline Dumbbell Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex21",
                            "name": "Slow Negative Push-Ups",
                            "sets": 3,
                            "reps": 6,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/negative-pushup.gif"
                        },
                        {
                            "id": "ex22",
                            "name": "Isometric Chest Squeeze",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-squeeze.gif"
                        },
                        {
                            "id": "ex23",
                            "name": "Decline Dumbbell Press",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-dumbbell-bench-press.gif"
                        }
                    ]

                },
                {
                    "id": "Day 10",
                    "name": "Day 10 - Active Recovery",
                    "isRestDay": true,
                    "exercises": [
                        {
                            "id": "ex24",
                            "name": "Plyo Push-Ups on Elevated Surface",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/elevated-plyo-pushup.gif"
                        },
                        {
                            "id": "ex25",
                            "name": "Spiderman Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/spiderman-push-up.gif"
                        },
                        {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex26",
                            "name": "Push-Up to Renegade Row",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/renegade-row.gif"
                        },
                        {
                            "id": "ex27",
                            "name": "Explosive Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/explosive-pushup.gif"
                        },
                        {
                            "id": "ex28",
                            "name": "Kneeling Archer Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/archer-push-up.gif"
                        },
                        {
                            "id": "ex29",
                            "name": "Band-Resisted Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/resistance-band-pushup.gif"
                        },
                        {
                            "id": "ex30",
                            "name": "Dumbbell Pullover",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/dumbbell-pullover.gif"
                        }
                    ]

                },
                {
                    "id": "Day 11",
                    "name": "Day 11 - Intensity Boost",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex31",
                            "name": "Incline Chest Press Machine or Dumbbells",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex32",
                            "name": "Flat Bench Chest Fly",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/chest-fly.gif"
                        }, {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex33",
                            "name": "Push-Up to Failure",
                            "sets": 2,
                            "reps": "To Failure",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/push-ups.gif"
                        },
                        {
                            "id": "ex34",
                            "name": "Crossbody Cable Chest Fly (or Band)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/crossbody-cable-chest-fly.gif"
                        },
                        {
                            "id": "ex35",
                            "name": "Incline Dumbbell Fly",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/incline-chest-fly.gif"
                        }
                    ]

                },
                {
                    "id": "day 12",
                    "name": "Day 12 - Volume Boost",
                    "sets": 4,
                    "exercises": [
                        {
                            "id": "ex36",
                            "name": "Close Grip Push-Ups",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/close-grip-pushup.gif"
                        },

                    ]

                },
                {
                    "id": "Day 13",
                    "name": "Day 13 - Foundation",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex1",
                            "name": "Push-Ups",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/05/push-ups.gif"
                        },
                        {},
                        {},
                        {},
                        {
                            "id": "ex2",
                            "name": "Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-pushup.gif"
                        },
                        {
                            "id": "ex3",
                            "name": "Wide Grip Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/wide-push-up.gif"
                        },
                        {
                            "id": "ex4",
                            "name": "Chest Dips",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-dips.gif"
                        },
                        {
                            "id": "ex5",
                            "name": "Incline Dumbbell Press",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex6",
                            "name": "Decline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-push-up.gif"
                        },
                        {
                            "id": "ex7",
                            "name": "Resistance Band Chest Press",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/band-chest-press.gif"
                        },
                        {
                            "id": "ex8",
                            "name": "Chest Fly (Dumbbells)",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/chest-fly.gif"
                        }
                    ]

                },
                {
                    "id": "Day 14",
                    "name": "Day 14 - Endurance Focus",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex9",
                            "name": "Plyometric Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/plyo-push-up.gif"
                        },
                        {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex10",
                            "name": "Clap Push-Ups",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/clap-push-up.gif"
                        },
                        {
                            "id": "ex11",
                            "name": "Incline Chest Fly (Dumbbells)",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/incline-chest-fly.gif"
                        },
                        {
                            "id": "ex12",
                            "name": "Resistance Band Chest Fly",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-chest-fly.gif"
                        },
                        {
                            "id": "ex13",
                            "name": "Push-Up Hold",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/push-up-hold.gif"
                        },
                        {
                            "id": "ex14",
                            "name": "Explosive Incline Push-Ups",
                            "sets": 3,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/explosive-pushup.gif"
                        },
                        {
                            "id": "ex15",
                            "name": "Push-Up to Side Plank",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/pushup-to-side-plank.gif"
                        },
                        {
                            "id": "ex16",
                            "name": "Chest Press with Resistance Band",
                            "sets": 3,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-chest-press.gif"
                        }
                    ]

                },
                {
                    "id": "Day 15",
                    "name": "Day 15 - Power & Core",
                    "sets": 3,
                    "exercises": [
                        {
                            "id": "ex17",
                            "name": "Weighted Push-Ups",
                            "sets": 4,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/03/weighted-pushup.gif"
                        },
                        {},
                        {},
                        {}, {},
                        {},
                        {},
                        {
                            "id": "ex18",
                            "name": "Dumbbell Bench Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/dumbbell-bench-press.gif"
                        },
                        {
                            "id": "ex19",
                            "name": "Cable Chest Fly (Alt: Band Fly)",
                            "sets": 4,
                            "reps": 12,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/cable-chest-fly.gif"
                        },
                        {
                            "id": "ex20",
                            "name": "Incline Dumbbell Press",
                            "sets": 4,
                            "reps": 10,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/incline-dumbbell-press.gif"
                        },
                        {
                            "id": "ex21",
                            "name": "Slow Negative Push-Ups",
                            "sets": 3,
                            "reps": 6,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/negative-pushup.gif"
                        },
                        {
                            "id": "ex22",
                            "name": "Isometric Chest Squeeze",
                            "sets": 3,
                            "duration": "30s",
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/chest-squeeze.gif"
                        },
                        {
                            "id": "ex23",
                            "name": "Decline Dumbbell Press",
                            "sets": 3,
                            "reps": 8,
                            "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/decline-dumbbell-bench-press.gif"
                        }
                    ]

                },

            ],
    },
    {
        name: "SHOULDER WORKOUT",
        category: "shoulders",
        image: "https://images.pexels.com/photos/17898141/pexels-photo-17898141/free-photo-of-a-muscular-man-flexing-his-muscles-at-the-gym.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        days: [
            {
                id: "Day 1",
                name: "Day 1 - Shoulder Foundation",
                sets: 3,
                exercises: [
                    {
                        id: "ex1",
                        name: "Dumbbell Shoulder Press",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-shoulder-press.gif"
                    },
                    {
                        id: "ex2",
                        name: "Lateral Raises",
                        sets: 3,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        id: "ex3",
                        name: "Front Raises",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/front-raise.gif"
                    },
                    {
                        id: "ex4",
                        name: "Arnold Press",
                        sets: 3,
                        reps: 10,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/arnold-press.gif"
                    },
                    {
                        id: "ex5",
                        name: "Rear Delt Fly",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        id: "ex6",
                        name: "Face Pulls (Resistance Band)",
                        sets: 3,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/band-face-pull.gif"
                    },
                    {
                        id: "ex7",
                        name: "Shoulder Taps",
                        sets: 3,
                        reps: 20,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/shoulder-taps.gif"
                    }
                ]
            },
            {
                id: "Day 2",
                name: "Day 2 - Strength & Stability",
                sets: 3,
                exercises: [
                    {
                        id: "ex8",
                        name: "Overhead Dumbbell Press",
                        sets: 4,
                        reps: 10,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/overhead-press.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        id: "ex9",
                        name: "Upright Rows",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/upright-row.gif"
                    },
                    {
                        id: "ex10",
                        name: "Resistance Band Lateral Raise",
                        sets: 3,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-lateral-raise.gif"
                    },
                    {
                        id: "ex11",
                        name: "Plank to Downward Dog Press",
                        sets: 3,
                        reps: 10,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2023/03/plank-to-downward-dog.gif"
                    },
                    {
                        id: "ex12",
                        name: "Reverse Cable Crosses (or Band)",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/reverse-cable-cross.gif"
                    },
                    {
                        id: "ex13",
                        name: "Pike Push-Ups",
                        sets: 3,
                        reps: 10,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pike-push-up.gif"
                    }
                ]
            },
            {
                id: "Day 3",
                name: "Day 3 - Hypertrophy Focus",
                sets: 4,
                exercises: [
                    {
                        id: "ex14",
                        name: "Seated Dumbbell Press",
                        sets: 4,
                        reps: 10,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-shoulder-press.gif"
                    },
                    {
                        id: "ex15",
                        name: "Bent-Over Rear Delt Raise",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/bent-over-rear-delt-raise.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        id: "ex16",
                        name: "Front Plate Raise",
                        sets: 3,
                        reps: 12,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/front-plate-raise.gif"
                    },
                    {
                        id: "ex17",
                        name: "Cable Lateral Raise (or Band)",
                        sets: 3,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/cable-lateral-raise.gif"
                    },
                    {
                        id: "ex18",
                        name: "Dumbbell Shrugs",
                        sets: 4,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-shrug.gif"
                    },
                    {
                        id: "ex19",
                        name: "Shoulder Circles",
                        sets: 3,
                        duration: "30s",
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/shoulder-circles.gif"
                    }
                ]
            },
            {
                id: "Day 4",
                name: "Day 4 - Active Recovery",
                isRestDay: true,
                exercises: [
                    {
                        id: "ex20",
                        name: "Band Pull Aparts",
                        sets: 3,
                        reps: 15,
                        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/04/band-pull-apart.gif"
                    },

                ]
            },
            {
                "id": "Day 5",
                "name": "Day 5 - Shoulder Power Press",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Arnold Press",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/arnold-press.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Standing Barbell Press",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/barbell-shoulder-press.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex3",
                        "name": "Cable Face Pulls",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/face-pull.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Dumbbell Upright Rows",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-upright-row.gif"
                    }
                ]
            },
            {
                "id": "Day 6",
                "name": "Day 6 - Rear Delt Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Lying Rear Delt Raises",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/03/rear-delt-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Side-Lying Lateral Raise",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/side-lying-lateral-raise.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Overhead Plate Hold",
                        "sets": 2,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/01/overhead-plate-hold.gif"
                    }
                ]
            },
            {
                "id": "Day 7",
                "name": "Day 7 - Machine & Bodyweight Mix",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Machine Shoulder Press",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/machine-shoulder-press.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Kettlebell Lateral Raises",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/kettlebell-lateral-raise.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex3",
                        "name": "Incline Bench Rear Delt Fly",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Pike Push-Ups",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pike-push-up.gif"
                    }
                ]
            },
            {
                "id": "Day 8",
                "name": "Day 8 - Shoulder Stability",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Z Press",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/z-press.gif"
                    },
                ]
            },
            {
                "id": "Day 9",
                "name": "Day 9 - Power and Isolation",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Landmine Press",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/landmine-press.gif"
                    },
                    {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Leaning Lateral Raises",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2023/01/leaning-lateral-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Dumbbell Reverse Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-reverse-fly.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Plate Front Raise",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 10",
                "name": "Day 10 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Lateral Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Front Plate Raise",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Rear Delt Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Overhead Hold",
                        "sets": 3,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-overhead-hold.gif"
                    }
                ]
            },
            {
                "id": "Day 11",
                "name": "Day 11 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Lateral Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Front Plate Raise",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Rear Delt Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Overhead Hold",
                        "sets": 3,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-overhead-hold.gif"
                    }
                ]
            },
            {
                "id": "Day 12",
                "name": "Day 12 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    },

                ]
            },
            {
                "id": "Day 13",
                "name": "Day 13 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Lateral Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex3",
                        "name": "Front Plate Raise",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Rear Delt Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Overhead Hold",
                        "sets": 3,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-overhead-hold.gif"
                    }
                ]
            },
            {
                "id": "Day 14",
                "name": "Day 14 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Lateral Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Front Plate Raise",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex4",
                        "name": "Rear Delt Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Overhead Hold",
                        "sets": 3,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-overhead-hold.gif"
                    }
                ]
            },
            {
                "id": "Day 15",
                "name": "Day 15 - Burnout & Finish Strong",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Seated Dumbbell Press",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/seated-dumbbell-press.gif"
                    }, {},
                    {},
                    {}, {},
                    {},
                    {},
                    {
                        "id": "ex2",
                        "name": "Lateral Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/lateral-raise.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Front Plate Raise",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/plate-front-raise.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Rear Delt Fly",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/rear-delt-fly.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Overhead Hold",
                        "sets": 3,
                        "reps": 30,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/12/dumbbell-overhead-hold.gif"
                    }
                ]
            },

        ]
    }
    ,
    {
        "name": "BACK WORKOUT",
        "category": "back",
        "image": "https://cdn.muscleandstrength.com/sites/default/files/field/feature-image/workout/intense_4_week_superset_workout_for_back_muscle_2.jpg",
        "days": [
            {
                "id": "Day 1",
                "name": "Day 1 - Back Foundation",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Pull-Ups",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pull-up.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Barbell Deadlifts",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-deadlift.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Seated Cable Rows",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-cable-row.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Lat Pulldowns",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lat-pulldown.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Dumbbell Rows",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-row.gif"
                    },
                    {
                        "id": "ex6",
                        "name": "Face Pulls",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/face-pull.gif"
                    }
                ]
            },
            {
                "id": "Day 2",
                "name": "Day 2 - Strength Focus",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex7",
                        "name": "Weighted Pull-Ups",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/weighted-pull-up.gif"
                    },
                    {
                        "id": "ex8",
                        "name": "T-Bar Rows",
                        "sets": 4,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/t-bar-row.gif"
                    },
                    {
                        "id": "ex9",
                        "name": "Single-Arm Dumbbell Rows",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-arm-dumbbell-row.gif"
                    },
                    {
                        "id": "ex10",
                        "name": "Straight-Arm Pulldowns",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/straight-arm-pulldown.gif"
                    }
                ]
            },
            {
                "id": "Day 3",
                "name": "Day 3 - Hypertrophy Focus",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex11",
                        "name": "Wide-Grip Lat Pulldowns",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/wide-grip-lat-pulldown.gif"
                    },
                    {
                        "id": "ex12",
                        "name": "Close-Grip Seated Cable Rows",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/close-grip-cable-row.gif"
                    },
                    {
                        "id": "ex13",
                        "name": "Hyperextensions",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hyperextension.gif"
                    },
                    {
                        "id": "ex14",
                        "name": "Reverse Fly Machine",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-fly-machine.gif"
                    }
                ]
            },
            {
                "id": "Day 4",
                "name": "Day 4 - Active Recovery",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex15",
                        "name": "Foam Rolling",
                        "sets": 1,
                        "duration": "5-10 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/foam-rolling.gif"
                    }
                ]
            },
            {
                "id": "Day 5",
                "name": "Day 5 - Power and Stability",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex16",
                        "name": "Kettlebell Swings",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/kettlebell-swing.gif"
                    },
                    {
                        "id": "ex17",
                        "name": "Chin-Ups",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/chin-up.gif"
                    },
                    {
                        "id": "ex18",
                        "name": "Landmine Rows",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/landmine-row.gif"
                    },
                    {
                        "id": "ex19",
                        "name": "Cable Pullovers",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-pullover.gif"
                    }
                ]
            },
            {
                "id": "Day 6",
                "name": "Day 6 - Functional Back",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex20",
                        "name": "Inverted Rows",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/inverted-row.gif"
                    },
                    {
                        "id": "ex21",
                        "name": "Farmer's Walk",
                        "sets": 3,
                        "duration": "30 seconds",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/farmers-walk.gif"
                    },
                    {
                        "id": "ex22",
                        "name": "Supermans",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/superman.gif"
                    },
                    {
                        "id": "ex23",
                        "name": "Bird Dogs",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bird-dog.gif"
                    }
                ]
            },
            {
                "id": "Day 7",
                "name": "Day 7 - Full Back Burnout",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex24",
                        "name": "Assisted Pull-Ups",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/assisted-pull-up.gif"
                    },
                    {
                        "id": "ex25",
                        "name": "Rack Pulls",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/rack-pull.gif"
                    },
                    {
                        "id": "ex26",
                        "name": "Cable Face Pulls",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/face-pull.gif"
                    },
                    {
                        "id": "ex27",
                        "name": "Dead Hang",
                        "sets": 3,
                        "duration": "30 seconds",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dead-hang.gif"
                    }
                ]
            },
            {
                "id": "Day 8",
                "name": "Day 8 - Back Endurance",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex28",
                        "name": "Bodyweight Rows",
                        "sets": 4,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/inverted-row.gif"
                    },
                    {
                        "id": "ex29",
                        "name": "Lat Pulldown Dropset",
                        "sets": 3,
                        "reps": "12/10/8",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lat-pulldown.gif"
                    },
                    {
                        "id": "ex30",
                        "name": "Back Extensions",
                        "sets": 3,
                        "reps": 20,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/back-extension.gif"
                    }
                ]
            },
            {
                "id": "Day 9",
                "name": "Day 9 - Advanced Strength",
                "sets": 5,
                "exercises": [
                    {
                        "id": "ex31",
                        "name": "Weighted Chin-Ups",
                        "sets": 5,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/weighted-chin-up.gif"
                    },
                    {
                        "id": "ex32",
                        "name": "Pendlay Rows",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pendlay-row.gif"
                    },
                    {
                        "id": "ex33",
                        "name": "Rack Chins",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/rack-chin-up.gif"
                    }
                ]
            },
            {
                "id": "Day 10",
                "name": "Day 10 - Active Recovery",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex34",
                        "name": "Yoga for Back Mobility",
                        "sets": 1,
                        "duration": "15-20 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/yoga-back-stretch.gif"
                    }
                ]
            },
            {
                "id": "Day 11",
                "name": "Day 11 - Unilateral Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex35",
                        "name": "Single-Arm Lat Pulldown",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-arm-lat-pulldown.gif"
                    },
                    {
                        "id": "ex36",
                        "name": "Single-Arm Cable Row",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-arm-cable-row.gif"
                    },
                    {
                        "id": "ex37",
                        "name": "Kneeling Single-Arm Pulldown",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/kneeling-single-arm-pulldown.gif"
                    }
                ]
            },
            {
                "id": "Day 12",
                "name": "Day 12 - Compound Overload",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex38",
                        "name": "Deadlift Variation",
                        "sets": 4,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-deadlift.gif"
                    },
                    {
                        "id": "ex39",
                        "name": "Weighted Pull-Ups",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/weighted-pull-up.gif"
                    },
                    {
                        "id": "ex40",
                        "name": "Chest-Supported Rows",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/chest-supported-row.gif"
                    }
                ]
            },
            {
                "id": "Day 13",
                "name": "Day 13 - Volume Training",
                "sets": 5,
                "exercises": [
                    {
                        "id": "ex41",
                        "name": "Lat Pulldown Variations",
                        "sets": 5,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lat-pulldown.gif"
                    },
                    {
                        "id": "ex42",
                        "name": "Seated Row Variations",
                        "sets": 5,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-cable-row.gif"
                    },
                    {
                        "id": "ex43",
                        "name": "Reverse Fly Superset",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-fly.gif"
                    }
                ]
            },
            {
                "id": "Day 14",
                "name": "Day 14 - Functional Strength",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex44",
                        "name": "Rope Climbs",
                        "sets": 3,
                        "reps": 3,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/rope-climb.gif"
                    },
                    {
                        "id": "ex45",
                        "name": "Towel Pull-Ups",
                        "sets": 3,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/towel-pull-up.gif"
                    },
                    {
                        "id": "ex46",
                        "name": "Sandbag Shouldering",
                        "sets": 3,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/sandbag-shouldering.gif"
                    }
                ]
            },
            {
                "id": "Day 15",
                "name": "Day 15 - Final Challenge",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex47",
                        "name": "Max Rep Pull-Ups",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pull-up.gif"
                    },
                    {
                        "id": "ex48",
                        "name": "Heavy Deadlifts",
                        "sets": 3,
                        "reps": 3,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-deadlift.gif"
                    },
                    {
                        "id": "ex49",
                        "name": "Back Circuit",
                        "sets": 3,
                        "duration": "5 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/back-workout-circuit.gif"
                    }
                ]
            }
        ]
    },
    {
        "name": "LOWER BODY WORKOUT",
        "category": "lower legs",
        "image": "https://www.muscletech.com/cdn/shop/articles/img-1710166503329.jpg?v=1731601517",
        "days": [
            {
                "id": "Day 1",
                "name": "Day 1 - Lower Body Foundation",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex1",
                        "name": "Barbell Squats",
                        "sets": 4,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-squat.gif"
                    },
                    {
                        "id": "ex2",
                        "name": "Romanian Deadlifts",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/romanian-deadlift.gif"
                    },
                    {
                        "id": "ex3",
                        "name": "Walking Lunges",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/walking-lunge.gif"
                    },
                    {
                        "id": "ex4",
                        "name": "Leg Press",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-press.gif"
                    },
                    {
                        "id": "ex5",
                        "name": "Seated Calf Raises",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-calf-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 2",
                "name": "Day 2 - Strength Focus",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex6",
                        "name": "Front Squats",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/front-squat.gif"
                    },
                    {
                        "id": "ex7",
                        "name": "Sumo Deadlifts",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/sumo-deadlift.gif"
                    },
                    {
                        "id": "ex8",
                        "name": "Bulgarian Split Squats",
                        "sets": 3,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bulgarian-split-squat.gif"
                    },
                    {
                        "id": "ex9",
                        "name": "Standing Calf Raises",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/standing-calf-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 3",
                "name": "Day 3 - Hypertrophy Focus",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex10",
                        "name": "Hack Squats",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hack-squat.gif"
                    },
                    {
                        "id": "ex11",
                        "name": "Leg Extensions",
                        "sets": 4,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-extension.gif"
                    },
                    {
                        "id": "ex12",
                        "name": "Lying Leg Curls",
                        "sets": 4,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lying-leg-curl.gif"
                    },
                    {
                        "id": "ex13",
                        "name": "Calf Press on Leg Press",
                        "sets": 4,
                        "reps": 20,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/calf-press.gif"
                    }
                ]
            },
            {
                "id": "Day 4",
                "name": "Day 4 - Active Recovery",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex14",
                        "name": "Foam Rolling",
                        "sets": 1,
                        "duration": "10-15 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/foam-rolling.gif"
                    }
                ]
            },
            {
                "id": "Day 5",
                "name": "Day 5 - Power Development",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex15",
                        "name": "Box Jumps",
                        "sets": 4,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/box-jump.gif"
                    },
                    {
                        "id": "ex16",
                        "name": "Trap Bar Deadlifts",
                        "sets": 4,
                        "reps": 8,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/trap-bar-deadlift.gif"
                    },
                    {
                        "id": "ex17",
                        "name": "Step-Ups",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/step-up.gif"
                    },
                    {
                        "id": "ex18",
                        "name": "Jump Squats",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jump-squat.gif"
                    }
                ]
            },
            {
                "id": "Day 6",
                "name": "Day 6 - Functional Lower Body",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex19",
                        "name": "Kettlebell Swings",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/kettlebell-swing.gif"
                    },
                    {
                        "id": "ex20",
                        "name": "Single-Leg Romanian Deadlifts",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-leg-romanian-deadlift.gif"
                    },
                    {
                        "id": "ex21",
                        "name": "Lateral Lunges",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lateral-lunge.gif"
                    },
                    {
                        "id": "ex22",
                        "name": "Farmer's Walk",
                        "sets": 3,
                        "duration": "30 seconds",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/farmers-walk.gif"
                    }
                ]
            },
            {
                "id": "Day 7",
                "name": "Day 7 - Glute & Hamstring Focus",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex23",
                        "name": "Hip Thrusts",
                        "sets": 4,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hip-thrust.gif"
                    },
                    {
                        "id": "ex24",
                        "name": "Good Mornings",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/good-morning.gif"
                    },
                    {
                        "id": "ex25",
                        "name": "Cable Pull-Throughs",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/cable-pull-through.gif"
                    },
                    {
                        "id": "ex26",
                        "name": "Seated Leg Curls",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/seated-leg-curl.gif"
                    }
                ]
            },
            {
                "id": "Day 8",
                "name": "Day 8 - Quad Dominant",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex27",
                        "name": "Back Squats",
                        "sets": 5,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-squat.gif"
                    },
                    {
                        "id": "ex28",
                        "name": "Leg Press (Narrow Stance)",
                        "sets": 4,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-press.gif"
                    },
                    {
                        "id": "ex29",
                        "name": "Sissy Squats",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/sissy-squat.gif"
                    }
                ]
            },
            {
                "id": "Day 9",
                "name": "Day 9 - Posterior Chain",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex30",
                        "name": "Deficit Deadlifts",
                        "sets": 4,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/deficit-deadlift.gif"
                    },
                    {
                        "id": "ex31",
                        "name": "Glute-Ham Raises",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/glute-ham-raise.gif"
                    },
                    {
                        "id": "ex32",
                        "name": "Reverse Hyperextensions",
                        "sets": 3,
                        "reps": 12,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/reverse-hyperextension.gif"
                    }
                ]
            },
            {
                "id": "Day 10",
                "name": "Day 10 - Active Recovery",
                "isRestDay": true,
                "exercises": [
                    {
                        "id": "ex33",
                        "name": "Yoga for Lower Body",
                        "sets": 1,
                        "duration": "20 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/yoga-lower-body.gif"
                    }
                ]
            },
            {
                "id": "Day 11",
                "name": "Day 11 - Unilateral Strength",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex34",
                        "name": "Pistol Squats",
                        "sets": 3,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pistol-squat.gif"
                    },
                    {
                        "id": "ex35",
                        "name": "Single-Leg Press",
                        "sets": 3,
                        "reps": 10,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-leg-press.gif"
                    },
                    {
                        "id": "ex36",
                        "name": "Single-Leg Calf Raises",
                        "sets": 3,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-leg-calf-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 12",
                "name": "Day 12 - Explosive Power",
                "sets": 4,
                "exercises": [
                    {
                        "id": "ex37",
                        "name": "Power Cleans",
                        "sets": 4,
                        "reps": 5,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/power-clean.gif"
                    },
                    {
                        "id": "ex38",
                        "name": "Depth Jumps",
                        "sets": 3,
                        "reps": 6,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/depth-jump.gif"
                    },
                    {
                        "id": "ex39",
                        "name": "Sled Pushes",
                        "sets": 3,
                        "duration": "30 seconds",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/sled-push.gif"
                    }
                ]
            },
            {
                "id": "Day 13",
                "name": "Day 13 - Volume Training",
                "sets": 5,
                "exercises": [
                    {
                        "id": "ex40",
                        "name": "Goblet Squats",
                        "sets": 4,
                        "reps": 15,
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/goblet-squat.gif"
                    },
                    {
                        "id": "ex41",
                        "name": "Leg Press Dropset",
                        "sets": 3,
                        "reps": "12/10/8",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-press.gif"
                    },
                    {
                        "id": "ex42",
                        "name": "Calf Raise Superset",
                        "sets": 3,
                        "reps": "15/12/10",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/standing-calf-raise.gif"
                    }
                ]
            },
            {
                "id": "Day 14",
                "name": "Day 14 - Full Lower Body Burnout",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex43",
                        "name": "Barbell Squats",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-squat.gif"
                    },
                    {
                        "id": "ex44",
                        "name": "Romanian Deadlifts",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/romanian-deadlift.gif"
                    },
                    {
                        "id": "ex45",
                        "name": "Leg Extensions",
                        "sets": 3,
                        "reps": "To Failure",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-extension.gif"
                    }
                ]
            },
            {
                "id": "Day 15",
                "name": "Day 15 - Final Challenge",
                "sets": 3,
                "exercises": [
                    {
                        "id": "ex46",
                        "name": "1RM Squat Test",
                        "sets": 3,
                        "reps": "1",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-squat.gif"
                    },
                    {
                        "id": "ex47",
                        "name": "1RM Deadlift Test",
                        "sets": 3,
                        "reps": "1",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-deadlift.gif"
                    },
                    {
                        "id": "ex48",
                        "name": "Lower Body Circuit",
                        "sets": 3,
                        "duration": "5 minutes",
                        "image": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lower-body-circuit.gif"
                    }
                ]
            }
        ]
    },
];

export default fitness;