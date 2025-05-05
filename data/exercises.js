const Workouts = [
    {
        id: "101",
        name: "Jumping Jacks",
        sets: 12,
        category: "full body",
        tips: [
            "Do not lift your arms and legs forward or backwards.",
            "Keep your knees slightly bent throughout the movement.",
            "Maintain a straight back and braced core."
        ],
        execution1: "Jump as you move your feet out to sides shoulder-width apart and swing your arms overhead in an arc motion.",
        execution2: "Jump back to the starting position and repeat.",
        preparation: "Stand with your legs close together and arms straight down at your sides.",
        image: "https://sworkit.com/wp-content/uploads/2020/06/sworkit-jumping-jack.gif",
    },
    {
        id: "501",
        name: "Mountain Climbers",
        sets: 15,
        category: "full body",
        tips: [
            "Keep your core tight to avoid sagging hips.",
            "Drive your knees toward your chest with control.",
            "Maintain a steady pace for endurance."
        ],
        execution1: "Start in a plank position with hands under shoulders.",
        execution2: "Alternately drive your knees toward your chest in a running motion.",
        preparation: "Engage your core and keep your back flat.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-climber.gif",
    },
    {
        id: "502",
        name: "Kettlebell Swings",
        sets: 12,
        category: "full body",
        tips: [
            "Use your hips to generate momentum, not your arms.",
            "Keep your back straight and core engaged.",
            "Squeeze your glutes at the top of the swing."
        ],
        execution1: "Stand with feet shoulder-width apart, holding a kettlebell with both hands.",
        execution2: "Hinge at your hips, swing the kettlebell back, then thrust forward to shoulder height.",
        preparation: "Choose a lightweight kettlebell to practice form first.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/09/Kettlebell-Swings.gif",
    },
    {
        id: "503",
        name: "Box Jumps",
        sets: 10,
        category: "full body",
        tips: [
            "Land softly on the box with bent knees.",
            "Use your arms to propel upward.",
            "Step down carefully to avoid injury."
        ],
        execution1: "Stand facing a sturdy box or platform.",
        execution2: "Jump onto the box, landing in a squat position, then stand tall.",
        preparation: "Start with a low height and progress gradually.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2015/07/The-Box-Jump.gif",
    },
    {
        id: "504",
        name: "Bear Crawls",
        sets: 8,
        category: "full body",
        tips: [
            "Keep your hips low and back flat.",
            "Move opposite arm and leg simultaneously.",
            "Engage your core to stabilize your torso."
        ],
        execution1: "Start on all fours with knees slightly off the ground.",
        execution2: "Crawl forward by moving right hand/left foot, then left hand/right foot.",
        preparation: "Wrists under shoulders, knees under hips.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bear-Crawl.gif",
    },
    {
        id: "505",
        name: "Renegade Rows",
        sets: 10,
        category: "full body",
        tips: [
            "Keep your body straight like a plank.",
            "Row the weight to your hip, not your chest.",
            "Avoid rotating your hips during the movement."
        ],
        execution1: "Start in a plank position holding dumbbells.",
        execution2: "Row one dumbbell to your hip while balancing on the other arm.",
        preparation: "Use lightweight dumbbells to master form.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/01/dumbbell-renegade-row-1.gif",
    },
    {
        id: "506",
        name: "Thrusters",
        sets: 12,
        category: "full body",
        tips: [
            "Sync the squat and overhead press into one fluid motion.",
            "Keep your core tight to protect your lower back.",
            "Press the weight directly overhead, not forward."
        ],
        execution1: "Hold dumbbells at shoulder height, squat down.",
        execution2: "Explode up from the squat, pressing the weights overhead.",
        preparation: "Start with light weights to focus on coordination.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Kettlebell-Thruster.gif",
    },
    {
        id: "507",
        name: "Deadlifts",
        sets: 10,
        category: "full body",
        tips: [
            "Push through your heels, not your toes.",
            "Keep the barbell close to your body.",
            "Engage your lats to protect your spine."
        ],
        execution1: "Stand with feet hip-width apart, barbell over mid-foot.",
        execution2: "Hinge at your hips, grab the bar, and stand up by driving through your heels.",
        preparation: "Start with light weights to practice hip hinge mechanics.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif",
    },
    {
        id: "508",
        name: "Clean & Press",
        sets: 8,
        category: "full body",
        tips: [
            "Use your legs to generate power for the clean.",
            "Press the weight overhead in one smooth motion.",
            "Keep your wrists straight during the press."
        ],
        execution1: "Lift the barbell from the floor to your shoulders (clean).",
        execution2: "Press the barbell overhead until arms are fully extended.",
        preparation: "Practice with a PVC pipe or light kettlebell first.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/04/Barbell-Clean-and-Press-.gif",
    },
    {
        id: "509",
        name: "Battle Ropes",
        sets: 5,
        duration: "30s",
        category: "full body",
        tips: [
            "Alternate waves for endurance or simultaneous waves for power.",
            "Keep your knees slightly bent and core engaged.",
            "Drive the movement from your shoulders, not just arms."
        ],
        execution1: "Hold one rope in each hand with knees bent.",
        execution2: "Create alternating waves by moving arms up and down rapidly.",
        preparation: "Anchor the ropes securely and stand in an athletic stance.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2015/07/Battle-Rope.gif",
    },
    {
        id: "510",
        name: "Turkish Get-Up",
        sets: 5,
        category: "full body",
        tips: [
            "Move slowly and control each phase.",
            "Keep your eyes on the kettlebell overhead.",
            "Use your legs to assist the stand-up."
        ],
        execution1: "Lie on your back holding a kettlebell overhead.",
        execution2: "Transition to standing while keeping the kettlebell locked out.",
        preparation: "Practice without weight to master the sequence.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/04/Turkish-Get-Up-Squat-style.gif",
    },
    {
        id: "102",
        name: "Push-Ups",
        sets: 10,
        category: "chest",
        tips: [
            "Keep your body in a straight line from head to heels.",
            "Engage your core to avoid sagging hips.",
            "Lower your chest until your elbows are at 90 degrees."
        ],
        execution1: "Start in a plank position with hands slightly wider than shoulder-width.",
        execution2: "Lower your body until your chest nearly touches the floor, then push back up.",
        preparation: "Place your hands firmly on the ground and extend your legs behind you.",
        image: "https://media.self.com/photos/583c641ca8746f6e65a60c7e/master/w_1600%2Cc_limit/DIAMOND_PUSHUP_MOTIFIED.gif",
    },
    {
        id: "601",
        name: "Dumbbell Bench Press",
        sets: 10,
        category: "chest",
        tips: [
            "Keep your feet flat on the floor for stability.",
            "Lower dumbbells until elbows are at 90 degrees.",
            "Press upward in a controlled motion, exhaling as you push."
        ],
        execution1: "Lie on a bench with dumbbells held above your chest, palms facing forward.",
        execution2: "Lower the weights slowly, then press back up to the starting position.",
        preparation: "Choose a weight that allows you to maintain proper form.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press-1.gif",
    },
    {
        id: "602",
        name: "Incline Push-Ups",
        sets: 12,
        category: "chest",
        tips: [
            "Place your hands on a bench or elevated surface.",
            "Keep your body straight from head to heels.",
            "Lower your chest toward the bench, then push back up."
        ],
        execution1: "Place your hands on a bench and extend your legs behind you.",
        execution2: "Lower your chest to the bench, then push up explosively.",
        preparation: "Adjust bench height to increase/decrease difficulty.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Incline-Push-Up.gif",
    },
    {
        id: "603",
        name: "Chest Fly (Dumbbell)",
        sets: 12,
        category: "chest",
        tips: [
            "Maintain a slight bend in your elbows.",
            "Imagine hugging a tree to engage the chest muscles.",
            "Avoid dropping weights too low to protect shoulders."
        ],
        execution1: "Lie on a bench with dumbbells extended above your chest, palms facing each other.",
        execution2: "Open your arms wide in an arc, then bring them back together.",
        preparation: "Use lighter weights to focus on muscle activation.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif",
    },
    {
        id: "604",
        name: "Pec Deck Machine",
        sets: 10,
        category: "chest",
        tips: [
            "Adjust the seat so handles align with your chest.",
            "Squeeze your pecs at the end of the movement.",
            "Avoid using momentum; control the weight."
        ],
        execution1: "Sit with your back flat against the pad and grip the handles.",
        execution2: "Bring the handles together in front of your chest, then slowly return.",
        preparation: "Set the weight to a manageable resistance.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif",
    },
    {
        id: "605",
        name: "Dips (Chest Focus)",
        sets: 8,
        category: "chest",
        tips: [
            "Lean forward slightly to target the chest.",
            "Lower until your shoulders are below your elbows.",
            "Press up forcefully but avoid locking elbows."
        ],
        execution1: "Grip parallel bars and lift your body with arms straight.",
        execution2: "Lower yourself by bending elbows, then push back up.",
        preparation: "Use an assisted dip machine if needed.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif",
    },
    {
        id: "606",
        name: "Resistance Band Chest Press",
        sets: 15,
        category: "chest",
        tips: [
            "Anchor the band at chest height behind you.",
            "Keep your wrists straight and core engaged.",
            "Squeeze your chest at the end of each rep."
        ],
        execution1: "Hold band handles at chest level, step forward to create tension.",
        execution2: "Press the bands forward until arms are extended, then slowly return.",
        preparation: "Ensure the band is securely anchored.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/05/Standing-incline-chest-press.gif",
    },
    {
        id: "607",
        name: "Decline Push-Ups",
        sets: 10,
        category: "chest",
        tips: [
            "Elevate your feet on a bench or step.",
            "Keep your hands slightly wider than shoulder-width.",
            "Lower your chest until it nearly touches the floor."
        ],
        execution1: "Place your feet on an elevated surface and hands on the floor.",
        execution2: "Lower your body, then push back up explosively.",
        preparation: "Start with a low elevation to test strength.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2015/07/Decline-Push-Up.gif",
    },
    {
        id: "608",
        name: "Medicine Ball Chest Pass",
        sets: 12,
        category: "chest",
        tips: [
            "Explode through the movement for power.",
            "Catch the ball with soft elbows to reduce joint stress.",
            "Use a wall or partner for rebounding."
        ],
        execution1: "Stand facing a wall/partner, holding a medicine ball at chest level.",
        execution2: "Push the ball forward forcefully, extending arms fully.",
        preparation: "Choose a ball weight that challenges but doesn’t compromise form.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2023/08/Standing-Medicine-Ball-Chest-Pass.gif",
    },
    {
        id: "609",
        name: "Single-Arm Dumbbell Press",
        sets: 10,
        category: "chest",
        tips: [
            "Keep your non-working hand on your hip for stability.",
            "Press the weight in a diagonal line (across your body).",
            "Engage your core to prevent twisting."
        ],
        execution1: "Lie on a bench with one dumbbell held at shoulder height.",
        execution2: "Press the weight upward, then lower slowly.",
        preparation: "Use lighter weights than usual for unilateral work.",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/05/single-arm-dumbbell-press.gif",
    },
    {
        id: "610",
        name: "Plyometric Push-Ups",
        sets: 8,
        category: "chest",
        tips: [
            "Land softly to protect your wrists.",
            "Explode upward with enough force to lift your hands off the floor.",
            "Modify by dropping to knees if needed."
        ],
        execution1: "Start in a standard push-up position.",
        execution2: "Lower your chest, then push up explosively, clapping mid-air.",
        preparation: "Master regular push-ups before attempting this.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Clap-Push-Up.gif",
    },
    {
        id: "103",
        name: "Squats",
        sets: 15,
        category: "legs",
        tips: [
            "Keep your knees aligned with your toes.",
            "Push your hips back as if sitting in a chair.",
            "Maintain weight on your heels, not toes."
        ],
        execution1: "Stand with feet shoulder-width apart and toes slightly turned out.",
        execution2: "Lower your hips until your thighs are parallel to the floor, then stand back up.",
        preparation: "Place your hands on your hips or extend them forward for balance.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/05/bodyweight-squat-full-version.gif",
    },
    {
        id: "701",
        name: "Barbell Back Squat",
        sets: 5,
        category: "legs",
        tips: [
            "Keep chest up and core tight",
            "Drive through your heels, not toes",
            "Lower until thighs are parallel to floor"
        ],
        execution1: "Position barbell on upper back, feet shoulder-width apart",
        execution2: "Lower into squat, then drive back up to standing",
        preparation: "Start with empty bar to practice form",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif" // Working squat GIF
    },
    {
        id: "702",
        name: "Romanian Deadlifts",
        sets: 4,
        category: "legs",
        tips: [
            "Maintain slight knee bend",
            "Push hips back, don't round spine",
            "Lower bar to mid-shin level"
        ],
        execution1: "Hold barbell with overhand grip, feet hip-width",
        execution2: "Hinge at hips to lower bar, then return to standing",
        preparation: "Use lighter weight to master hip hinge",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif" // RDL GIF
    },
    {
        id: "703",
        name: "Bulgarian Split Squats",
        sets: 3,
        category: "legs",
        tips: [
            "Keep front knee aligned with toes",
            "Lower until back knee nearly touches floor",
            "Maintain upright torso"
        ],
        execution1: "Place one foot on bench behind you, other foot forward",
        execution2: "Lower into lunge, then push through front heel to rise",
        preparation: "Start bodyweight-only for balance",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/02/Bodyweight-Bulgarian-Split-Squat.gif" // Split squat GIF
    },
    {
        id: "704",
        name: "Calf Raises",
        sets: 15,
        category: "legs",
        tips: [
            "Pause at top for 1-2 seconds",
            "Control the descent",
            "Use full range of motion"
        ],
        execution1: "Stand on edge of step with heels hanging off",
        execution2: "Raise onto toes, then lower below step level",
        preparation: "Hold wall for balance if needed",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Single-Leg-Calf-Raises.gif" // Calf raise GIF
    },
    {
        id: "705",
        name: "Step-Ups",
        sets: 10,
        category: "legs",
        tips: [
            "Drive through heel, not pushing off back foot",
            "Keep torso upright",
            "Use bench height that creates 90° knee bend"
        ],
        execution1: "Face bench, place one foot firmly on surface",
        execution2: "Press through heel to lift body up, then control descent",
        preparation: "Start without weights",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/04/Lateral-Step-up.gif" // Step-up GIF
    },
    {
        id: "706",
        name: "Glute Bridges",
        sets: 12,
        category: "legs",
        tips: [
            "Squeeze glutes at top",
            "Don't hyperextend lower back",
            "Keep chin tucked"
        ],
        execution1: "Lie on back with knees bent, feet flat",
        execution2: "Lift hips until body forms straight line",
        preparation: "Add resistance band above knees for activation",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge-.gif" // Bridge GIF
    },
    {
        id: "707",
        name: "Wall Sits",
        sets: 3,
        duration: "45s",
        category: "legs",
        tips: [
            "Keep back flat against wall",
            "Thighs parallel to floor",
            "Breathe steadily"
        ],
        execution1: "Slide down wall until knees at 90° angle",
        execution2: "Hold position for time",
        preparation: "Use timer for progression",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Wall-Sit.png" // Wall sit GIF
    },
    {
        id: "708",
        name: "Jump Squats",
        sets: 8,
        category: "legs",
        tips: [
            "Land softly on mid-foot",
            "Use arms for momentum",
            "Explode upward maximally"
        ],
        execution1: "Lower into squat position",
        execution2: "Jump vertically, reaching arms overhead",
        preparation: "Master bodyweight squats first",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jump-Squat.gif" // Jump squat GIF
    },
    {
        id: "709",
        name: "Curtsy Lunges",
        sets: 10,
        category: "legs",
        tips: [
            "Step diagonally backward",
            "Keep front knee tracking over toes",
            "Engage glutes"
        ],
        execution1: "Stand tall, step one foot back and across",
        execution2: "Lower until front thigh is parallel, then return",
        preparation: "Hold onto wall for balance if needed",
        image: "https://fitnessprogramer.com/wp-content/uploads/2023/09/curtsy-lunge.gif" // Curtsy lunge GIF
    },
    {
        id: "710",
        name: "Seated Leg Extensions",
        sets: 12,
        category: "legs",
        tips: [
            "Control the movement",
            "Pause at top contraction",
            "Don't lock knees"
        ],
        execution1: "Sit at machine with pad above ankles",
        execution2: "Extend legs fully, then slowly lower",
        preparation: "Start with light weight",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/07/Seated-Leg-Extension-with-Resistance-Band.gif" // Leg extension GIF
    },
    {
        id: "201",
        name: "Plank",
        sets: 3,

        category: "abs",
        duration: "30s",
        tips: [
            "Avoid lifting your hips too high or letting them sag.",
            "Engage your glutes and core for stability.",
            "Breathe steadily and hold the position."
        ],
        execution1: "Start in a forearm plank position with elbows under your shoulders.",
        execution2: "Hold the position while keeping your body straight.",
        preparation: "Lie face down, then lift your body onto your forearms and toes.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif",
    },
    {
        id: "202",
        name: "Russian Twists",
        sets: 12,
        category: "abs",
        tips: [
            "Rotate from your torso, not just your arms.",
            "Keep your feet elevated for added difficulty.",
            "Move slowly to engage obliques fully."
        ],
        execution1: "Sit on the floor with knees bent and lean back slightly.",
        execution2: "Twist your torso side to side, touching the floor beside your hips.",
        preparation: "Clasp your hands together or hold a weight for resistance.",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2023/09/russian-twist.gif",
    },
    {
        id: "301",
        name: "Burpees",
        sets: 10,
        category: "full body",
        tips: [
            "Land softly when jumping to protect your knees.",
            "Explode upward during the jump for maximum intensity.",
            "Keep your core tight during the plank portion."
        ],
        execution1: "Start standing, then drop into a squat with hands on the floor.",
        execution2: "Kick your feet back into a plank, do a push-up, then jump up.",
        preparation: "Stand tall with feet shoulder-width apart.",
        image: "https://media3.popsugar-assets.com/files/thumbor/0Xiqpo7pxrKz5CKcRl7XYrKegko/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/02/27/847/n/1922729/1baf9ec0f5ce4ea9_burpee.3.gif",
    },
    {
        id: "302",
        name: "High Knees",
        category: "abs",
        sets: 20,
        tips: [
            "Lift your knees to hip height or higher.",
            "Pump your arms to increase intensity.",
            "Stay on the balls of your feet for agility."
        ],
        execution1: "Stand tall and begin jogging in place.",
        execution2: "Drive your knees upward as high as possible with each step.",
        preparation: "Stand with feet hip-width apart and arms bent at 90 degrees.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/08/High-Knee-Run.gif",
    },
    {
        id: "401",
        name: "Cobra Stretch",
        sets: 5,
        category: "abs",
        duration: "15s",
        tips: [
            "Press your pelvis into the floor to protect your lower back.",
            "Keep shoulders relaxed away from your ears.",
            "Breathe deeply to enhance the stretch."
        ],
        execution1: "Lie face down with hands under your shoulders.",
        execution2: "Press your upper body upward while keeping hips grounded.",
        preparation: "Extend your legs straight behind you and relax your glutes.",
        image: "https://www.yogajournal.com/wp-content/uploads/2021/12/Cobra.gif?width=730",
    },
    {
        id: "901",
        name: "Hanging Leg Raises",
        sets: 8,
        category: "abs",
        tips: [
            "Avoid swinging - control the movement",
            "Exhale as you lift legs",
            "Engage lower abs by tilting pelvis"
        ],
        execution1: "Hang from pull-up bar with arms straight",
        execution2: "Raise legs to 90° while leaning back slightly",
        preparation: "Use ab straps if grip fatigues first",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/06/hanging-leg-raise-movement.gif" // Hanging leg raise GIF
    },
    {
        id: "902",
        name: "Ab Wheel Rollouts",
        sets: 10,
        category: "abs",
        tips: [
            "Keep core braced throughout",
            "Don't extend beyond shoulder capability",
            "Tuck pelvis to protect lower back"
        ],
        execution1: "Kneel with ab wheel in hands, arms straight",
        execution2: "Roll forward until body is nearly parallel to floor, then return",
        preparation: "Start with short rollouts",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/01/ab-wheel.gif" // Ab wheel GIF
    },
    {
        id: "903",
        name: "Dragon Flags",
        sets: 6,
        category: "abs",
        tips: [
            "Press lower back into bench",
            "Lower slowly (3-5 seconds)",
            "Stop when you can't maintain form"
        ],
        execution1: "Lie on bench, grip behind head for support",
        execution2: "Lift entire torso and legs up, then lower with control",
        preparation: "Master lying leg raises first",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/07/Leg-Raise-Dragon-Flag.gif" // Dragon flag GIF
    },
    {
        id: "904",
        name: "Cable Woodchoppers",
        sets: 12,
        category: "abs",
        tips: [
            "Rotate from torso, not arms",
            "Keep feet planted",
            "Control the return movement"
        ],
        execution1: "Stand sideways to cable machine, grip handle with both hands",
        execution2: "Pull cable diagonally across body while rotating torso",
        preparation: "Use light weight to learn pattern",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/07/wood-chop-768x625.png" // Woodchopper GIF
    },
    {
        id: "905",
        name: "L-Sit Hold",
        sets: 3,
        duration: "20s",
        category: "abs",
        tips: [
            "Push shoulders down (away from ears)",
            "Maintain straight legs",
            "Breathe steadily"
        ],
        execution1: "Sit between parallel bars or on floor",
        execution2: "Lift body off ground, legs straight out",
        preparation: "Start with knees bent if needed",
        image: "https://i.gifer.com/3Q7y.gif" // L-sit GIF
    },
    {
        id: "906",
        name: "Reverse Crunches",
        sets: 15,
        category: "abs",
        tips: [
            "Lift hips off floor, not just legs",
            "Exhale at top of movement",
            "Avoid neck strain"
        ],
        execution1: "Lie on back, knees bent 90°",
        execution2: "Roll pelvis up to bring knees toward chest",
        preparation: "Place hands under hips for support",
        image: "https://www.inspireusafoundation.org/wp-content/uploads/2022/01/crunch.gif" // Reverse crunch GIF
    },
    {
        id: "907",
        name: "Hanging Knee Raises with Twist",
        sets: 10,
        category: "abs",
        tips: [
            "Control the rotation",
            "Engage obliques",
            "Avoid momentum"
        ],
        execution1: "Hang from bar, lift knees to chest",
        execution2: "Rotate knees to one side, then the other",
        preparation: "Master straight knee raises first",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Knee-Raises.gif" // Hanging twist GIF
    },
    {
        id: "908",
        name: "Dead Bug",
        sets: 12,
        category: "abs",
        tips: [
            "Press lower back into floor",
            "Move limbs slowly",
            "Exhale as you extend"
        ],
        execution1: "Lie on back, arms up and knees bent 90°",
        execution2: "Simultaneously extend opposite arm/leg without arching back",
        preparation: "Try without weights first",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Dead-Bug.gif" // Dead bug GIF
    },
    {
        id: "909",
        name: "Standing Cable Crunch",
        sets: 15,
        category: "abs",
        tips: [
            "Flex spine downward",
            "Keep hips stationary",
            "Squeeze at bottom"
        ],
        execution1: "Stand facing cable machine, rope attachment overhead",
        execution2: "Curl downward while keeping arms fixed",
        preparation: "Adjust weight to maintain form",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/09/Standing-Cable-Crunch.gif" // Cable crunch GIF
    },
    {
        id: "910",
        name: "Side Plank with Hip Dips",
        sets: 3,
        duration: "30s",
        category: "abs",
        tips: [
            "Stack shoulders over wrist",
            "Lower hips just a few inches",
            "Engage obliques"
        ],
        execution1: "Support body on one forearm and side of foot",
        execution2: "Lower and lift hips slightly while maintaining line",
        preparation: "Start with knees bent if needed",
        image: "https://fitnessprogramer.com/wp-content/uploads/2025/03/Side-Plank-Hip-Adduction-Copenhagen-adduction.gif" // Side plank dip GIF
    },
    {
        id: "402",
        name: "Shoulder Stretch",
        sets: 5,
        category: "arms",
        tips: [
            "Hold the stretch for 15–30 seconds per side.",
            "Avoid rounding your back; keep your chest open.",
            "Use a towel or strap if you can’t reach your hands."
        ],
        execution1: "Bring one arm across your chest and hold it with the opposite hand.",
        execution2: "Gently pull until you feel a stretch in your shoulder.",
        preparation: "Stand or sit tall with your spine straight.",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/04/Across-Chest-Shoulder-Stretch.gif",
    },
    {
        id: "801",
        name: "Dumbbell Bicep Curls",
        sets: 12,
        category: "arms",
        tips: [
            "Keep elbows pinned to your sides",
            "Control the descent (3 seconds down)",
            "Avoid swinging your body"
        ],
        execution1: "Stand tall with dumbbells at your sides, palms forward",
        execution2: "Curl weights toward shoulders, then slowly lower",
        preparation: "Choose a weight that challenges last 2 reps",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif" // Bicep curl GIF
    },
    {
        id: "802",
        name: "Triceps Dips",
        sets: 10,
        category: "arms",
        tips: [
            "Keep shoulders down (away from ears)",
            "Lower until elbows form 90° angles",
            "Lean slightly forward for triceps focus"
        ],
        execution1: "Grip parallel bars, lift body with arms straight",
        execution2: "Bend elbows to lower body, then push back up",
        preparation: "Use assisted dip machine if needed",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bench-Dips.gif" // Triceps dip GIF
    },
    {
        id: "803",
        name: "Hammer Curls",
        sets: 10,
        category: "arms",
        tips: [
            "Maintain neutral (palms-in) grip",
            "Squeeze at the top for brachialis activation",
            "Keep wrists straight"
        ],
        execution1: "Hold dumbbells at sides with palms facing inward",
        execution2: "Curl weights up while maintaining grip position",
        preparation: "Lighter weight than traditional curls",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/04/dumbbell-reverse-curl.gif" // Hammer curl GIF
    },
    {
        id: "804",
        name: "Skull Crushers (EZ Bar)",
        sets: 8,
        category: "arms",
        tips: [
            "Lower bar to forehead (not nose)",
            "Keep upper arms perpendicular to floor",
            "Use spotter for heavy weights"
        ],
        execution1: "Lie on bench, hold EZ bar above chest with narrow grip",
        execution2: "Bend elbows to lower bar toward forehead, then extend",
        preparation: "Start with empty bar to practice form",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/02/Barbell-Reverse-Grip-Skullcrusher-1.gif" // Skull crusher GIF
    },
    {
        id: "805",
        name: "Preacher Curls",
        sets: 10,
        category: "arms",
        tips: [
            "Lean chest against pad to isolate biceps",
            "Don't fully extend elbows at bottom",
            "Control the negative phase"
        ],
        execution1: "Sit at preacher bench, rest arms on pad",
        execution2: "Curl weight up, then slowly lower",
        preparation: "Use EZ bar or dumbbells",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Z-Bar-Preacher-Curl.gif" // Preacher curl GIF
    },
    {
        id: "806",
        name: "Overhead Triceps Extension",
        sets: 12,
        category: "arms",
        tips: [
            "Keep elbows close to ears",
            "Lower dumbbell behind head (not neck)",
            "Engage core for stability"
        ],
        execution1: "Hold one dumbbell with both hands overhead",
        execution2: "Bend elbows to lower weight behind head, then extend",
        preparation: "Start with light weight (10-15lbs)",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Seated-EZ-Bar-Overhead-Triceps-Extension.gif" // Overhead extension GIF
    },
    {
        id: "807",
        name: "Reverse Curls",
        sets: 12,
        category: "arms",
        tips: [
            "Use overhand (palms-down) grip",
            "Focus on forearm engagement",
            "Minimize wrist movement"
        ],
        execution1: "Hold barbell with shoulder-width overhand grip",
        execution2: "Curl bar upward while keeping elbows stationary",
        preparation: "Lighter weight than regular curls",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Reverse-Curl.gif" // Reverse curl GIF
    },
    {
        id: "808",
        name: "Close-Grip Bench Press",
        sets: 8,
        category: "arms",
        tips: [
            "Hands shoulder-width apart",
            "Keep elbows tucked (not flared)",
            "Press through triceps at lockout"
        ],
        execution1: "Lie on bench, grip barbell with narrow hand placement",
        execution2: "Lower bar to mid-chest, then press up",
        preparation: "Reduce weight by 20% vs regular bench",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif" // Close-grip bench GIF
    },
    {
        id: "809",
        name: "Zottman Curls",
        sets: 10,
        category: "arms",
        tips: [
            "Rotate grip at top of movement",
            "Control descent with palms-down grip",
            "Works biceps and forearms"
        ],
        execution1: "Curl dumbbells up with palms up",
        execution2: "At top, rotate palms down for lowering phase",
        preparation: "Very light weight to start",
        image: "https://fitnessprogramer.com/wp-content/uploads/2021/04/zottman-curl.gif" // Zottman curl GIF
    },
    {
        id: "810",
        name: "Farmers Walk",
        sets: 3,
        duration: "30s",
        category: "arms",
        tips: [
            "Keep shoulders back and down",
            "Grip weights tightly",
            "Walk with short, controlled steps"
        ],
        execution1: "Hold heavy dumbbells/kettlebells at sides",
        execution2: "Walk forward maintaining upright posture",
        preparation: "Start with 50% body weight total",
        image: "https://fitnessprogramer.com/wp-content/uploads/2022/02/Farmers-walk_Cardio.gif" // Farmers walk GIF
    }
];

export default Workouts;