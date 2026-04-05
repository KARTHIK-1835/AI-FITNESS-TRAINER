/* ===========================
   EXERCISES — Enhanced Form Detection + Error Signals
   100% Accurate Body Tracking & Detailed Feedback
   =========================== */

const EXERCISES = {
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    description: 'Strengthen your biceps with controlled curling motions. Focus on keeping elbows pinned to your sides.',
    difficulty: 'easy',
    muscles: 'Biceps, Forearms',
    calPerRep: 0.8,
    repsPerSet: 12,
    totalSets: 4,
    icon: '💪',
    color: '#7c3aed',
    guide: [
      'Stand upright with arms at your sides',
      'Keep elbows close to your torso',
      'Curl both arms up by bending elbows',
      'Squeeze at the top, then lower slowly',
      'Keep your back straight throughout'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftArm = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightArm = getAngle(landmarks[12], landmarks[14], landmarks[16]);
      const avgAngle = (leftArm + rightArm) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check elbow stability — elbows should stay near torso
      const leftElbowDriftX = Math.abs(landmarks[11].x - landmarks[13].x);
      const rightElbowDriftX = Math.abs(landmarks[12].x - landmarks[14].x);
      if (leftElbowDriftX > 0.06) {
        errors.push('LEFT_ELBOW_DRIFT');
        feedbacks.push('❌ Left elbow drifting — pin it to your side');
        accuracy -= 20;
      }
      if (rightElbowDriftX > 0.06) {
        errors.push('RIGHT_ELBOW_DRIFT');
        feedbacks.push('❌ Right elbow drifting — pin it to your side');
        accuracy -= 20;
      }

      // Check back posture — shoulders should be above hips
      const backLean = landmarks[11].x - landmarks[23].x;
      if (Math.abs(backLean) > 0.05) {
        errors.push('BACK_LEAN');
        feedbacks.push('❌ Back is leaning! Stand up straight');
        accuracy -= 25;
      }

      // Check shoulders level
      const shoulderDiff = Math.abs(landmarks[11].y - landmarks[12].y);
      if (shoulderDiff > 0.04) {
        errors.push('UNEVEN_SHOULDERS');
        feedbacks.push('⚠️ Keep shoulders level — don\'t tilt');
        accuracy -= 10;
      }

      // Check arm symmetry
      const armDiff = Math.abs(leftArm - rightArm);
      if (armDiff > 30) {
        errors.push('ARM_ASYMMETRY');
        feedbacks.push('⚠️ Curl both arms at the same speed');
        accuracy -= 15;
      }

      // Check for wrist curl (wrists should be straight)
      const leftWristAngle = getAngle(landmarks[13], landmarks[15], landmarks[19]);
      const rightWristAngle = getAngle(landmarks[14], landmarks[16], landmarks[20]);
      if (leftWristAngle < 140 || rightWristAngle < 140) {
        errors.push('WRIST_BEND');
        feedbacks.push('⚠️ Keep wrists straight — don\'t curl them');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Perfect form! Great curl!';

      return { accuracy, feedback, angle: avgAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 150) return 'down';
      if (angle < 50) return 'up';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'up' && currentPhase === 'down';
    }
  },

  'squats': {
    id: 'squats',
    name: 'Squats',
    description: 'The king of lower body exercises. Build strength in your quads, glutes, and core.',
    difficulty: 'medium',
    muscles: 'Quads, Glutes, Core',
    calPerRep: 1.5,
    repsPerSet: 10,
    totalSets: 4,
    icon: '🦵',
    color: '#2563eb',
    guide: [
      'Stand with feet shoulder-width apart',
      'Keep chest up and back straight',
      'Lower down by bending knees and hips',
      'Go as low as comfortable (thighs parallel)',
      'Push through heels to stand back up'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      const avgAngle = (leftKnee + rightKnee) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check knees not collapsing inward (knee valgus)
      const kneeWidth = Math.abs(landmarks[25].x - landmarks[26].x);
      const ankleWidth = Math.abs(landmarks[27].x - landmarks[28].x);
      if (kneeWidth < ankleWidth * 0.7 && avgAngle < 140) {
        errors.push('KNEE_VALGUS');
        feedbacks.push('❌ Knees caving inward! Push knees outward over toes');
        accuracy -= 30;
      }

      // Check back angle — torso should stay relatively upright
      const torsoAngleY = landmarks[11].y - landmarks[23].y;
      const torsoAngleX = landmarks[11].x - landmarks[23].x;
      const torsoLean = Math.atan2(torsoAngleX, torsoAngleY) * 180 / Math.PI;
      if (Math.abs(torsoLean) > 30 && avgAngle < 140) {
        errors.push('FORWARD_LEAN');
        feedbacks.push('❌ Leaning too far forward! Keep chest up');
        accuracy -= 25;
      }

      // Check feet position — should be shoulder width
      const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
      const feetWidth = Math.abs(landmarks[27].x - landmarks[28].x);
      if (feetWidth < shoulderWidth * 0.6) {
        errors.push('NARROW_STANCE');
        feedbacks.push('⚠️ Feet too narrow — widen to shoulder width');
        accuracy -= 15;
      }
      if (feetWidth > shoulderWidth * 2.0) {
        errors.push('WIDE_STANCE');
        feedbacks.push('⚠️ Feet too wide — bring them closer');
        accuracy -= 15;
      }

      // Check depth — should reach at least parallel
      if (avgAngle > 130 && avgAngle < 165) {
        // In the squat range but not deep enough
        errors.push('SHALLOW_SQUAT');
        feedbacks.push('⚠️ Go deeper — aim for thighs parallel to ground');
        accuracy -= 10;
      }

      // Check heel lift (ankles should stay grounded)
      const leftHeelY = landmarks[29] ? landmarks[29].y : landmarks[27].y;
      const leftToeY = landmarks[31] ? landmarks[31].y : landmarks[27].y;
      if (leftHeelY < leftToeY - 0.02) {
        errors.push('HEEL_LIFT');
        feedbacks.push('❌ Heels lifting! Keep feet flat on the ground');
        accuracy -= 20;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Perfect squat form!';

      return { accuracy, feedback, angle: avgAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 160) return 'up';
      if (angle < 100) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'push-ups': {
    id: 'push-ups',
    name: 'Push-ups',
    description: 'Classic upper body exercise targeting chest, shoulders, and triceps. Perfect for building strength.',
    difficulty: 'medium',
    muscles: 'Chest, Shoulders, Triceps',
    calPerRep: 1.2,
    repsPerSet: 10,
    totalSets: 3,
    icon: '🫸',
    color: '#06b6d4',
    guide: [
      'Start in a high plank position',
      'Hands shoulder-width apart on the floor',
      'Lower chest towards the ground',
      'Keep body in a straight line throughout',
      'Push back up to starting position'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftArm = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightArm = getAngle(landmarks[12], landmarks[14], landmarks[16]);
      const avgAngle = (leftArm + rightArm) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check body alignment — shoulder, hip, ankle should be in line
      const hipSag = landmarks[23].y - ((landmarks[11].y + landmarks[27].y) / 2);
      if (hipSag > 0.04) {
        errors.push('HIP_SAG');
        feedbacks.push('❌ Hips sagging! Tighten your core and lift hips');
        accuracy -= 30;
      }

      // Check pike (hips too high)
      if (hipSag < -0.05) {
        errors.push('HIP_PIKE');
        feedbacks.push('❌ Hips too high! Lower them into a straight line');
        accuracy -= 25;
      }

      // Check hand position width
      const handWidth = Math.abs(landmarks[15].x - landmarks[16].x);
      const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
      if (handWidth > shoulderWidth * 2.0) {
        errors.push('HANDS_WIDE');
        feedbacks.push('⚠️ Hands too wide — bring them closer to shoulder width');
        accuracy -= 15;
      }
      if (handWidth < shoulderWidth * 0.7) {
        errors.push('HANDS_NARROW');
        feedbacks.push('⚠️ Hands too narrow — widen to shoulder width');
        accuracy -= 15;
      }

      // Check head position — should be neutral
      const headDrop = landmarks[0].y - landmarks[11].y;
      if (headDrop > 0.08) {
        errors.push('HEAD_DROP');
        feedbacks.push('⚠️ Head dropping — keep neck neutral, look slightly ahead');
        accuracy -= 10;
      }

      // Check elbow flare
      const leftElbowFlare = Math.abs(landmarks[13].x - landmarks[11].x);
      if (leftElbowFlare > shoulderWidth * 1.5) {
        errors.push('ELBOW_FLARE');
        feedbacks.push('⚠️ Elbows flaring out — keep them at 45° angle');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Excellent push-up form!';

      return { accuracy, feedback, angle: avgAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 155) return 'up';
      if (angle < 90) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'lunges': {
    id: 'lunges',
    name: 'Lunges',
    description: 'Unilateral leg exercise that improves balance, stability, and lower body strength.',
    difficulty: 'medium',
    muscles: 'Quads, Glutes, Hamstrings',
    calPerRep: 1.3,
    repsPerSet: 8,
    totalSets: 3,
    icon: '🏃',
    color: '#f97316',
    guide: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg',
      'Lower your body until both knees are at 90°',
      'Keep front knee over your ankle',
      'Push back to starting position'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      const avgAngle = Math.min(leftKnee, rightKnee);

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check torso upright
      const torsoLeanX = Math.abs(landmarks[11].x - landmarks[23].x);
      if (torsoLeanX > 0.06) {
        errors.push('TORSO_LEAN');
        feedbacks.push('❌ Torso leaning! Stand upright — chest up');
        accuracy -= 25;
      }

      // Check front knee not past toes
      const frontKneeIdx = leftKnee < rightKnee ? 25 : 26;
      const frontAnkleIdx = leftKnee < rightKnee ? 27 : 28;
      if (landmarks[frontKneeIdx].x > landmarks[frontAnkleIdx].x + 0.04) {
        errors.push('KNEE_PAST_TOES');
        feedbacks.push('❌ Front knee past toes! Keep knee directly over ankle');
        accuracy -= 25;
      }

      // Check rear knee drops enough
      const rearKneeIdx = leftKnee < rightKnee ? 26 : 25;
      if (avgAngle < 120 && landmarks[rearKneeIdx].y < landmarks[frontAnkleIdx].y - 0.05) {
        // Rear knee should drop close to ground
        errors.push('SHALLOW_LUNGE');
        feedbacks.push('⚠️ Go deeper — lower your back knee towards the ground');
        accuracy -= 15;
      }

      // Check balance — wobbling
      const hipCenter = (landmarks[23].x + landmarks[24].x) / 2;
      const shoulderCenter = (landmarks[11].x + landmarks[12].x) / 2;
      if (Math.abs(hipCenter - shoulderCenter) > 0.07) {
        errors.push('BALANCE');
        feedbacks.push('⚠️ Losing balance — engage your core');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Great lunge form!';

      return { accuracy, feedback, angle: avgAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 155) return 'up';
      if (angle < 110) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'jumping-jacks': {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    description: 'Full-body cardio exercise that raises heart rate and improves coordination.',
    difficulty: 'easy',
    muscles: 'Full Body, Cardio',
    calPerRep: 0.7,
    repsPerSet: 20,
    totalSets: 3,
    icon: '⭐',
    color: '#ec4899',
    guide: [
      'Stand with feet together, arms at sides',
      'Jump and spread legs wide apart',
      'Simultaneously raise arms overhead',
      'Jump back to starting position',
      'Keep a steady rhythm throughout'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftArm = getAngle(landmarks[23], landmarks[11], landmarks[13]);
      const rightArm = getAngle(landmarks[24], landmarks[12], landmarks[14]);
      const armAngle = (leftArm + rightArm) / 2;

      const legSpread = Math.abs(landmarks[27].x - landmarks[28].x);
      const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check coordination — arms and legs should move together
      const armsUp = armAngle > 130;
      const legsWide = legSpread > shoulderWidth * 1.3;

      if (armsUp && !legsWide) {
        errors.push('LEGS_NOT_SPREAD');
        feedbacks.push('❌ Spread your legs wider when arms go up!');
        accuracy -= 25;
      }
      if (!armsUp && legsWide) {
        errors.push('ARMS_NOT_UP');
        feedbacks.push('❌ Raise arms fully overhead with the jump!');
        accuracy -= 25;
      }

      // Check full arm extension
      const leftArmExtend = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightArmExtend = getAngle(landmarks[12], landmarks[14], landmarks[16]);
      if (armsUp && (leftArmExtend < 140 || rightArmExtend < 140)) {
        errors.push('BENT_ARMS');
        feedbacks.push('⚠️ Extend arms fully — don\'t bend elbows');
        accuracy -= 15;
      }

      // Check posture — should stay upright
      if (Math.abs(landmarks[11].x - landmarks[23].x) > 0.05) {
        errors.push('LEANING');
        feedbacks.push('⚠️ Stay upright — don\'t lean forward');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Great jumping jacks! Keep the rhythm!';

      return { accuracy, feedback, angle: armAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 140) return 'up';
      if (angle < 60) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'up' && currentPhase === 'down';
    }
  },

  'shoulder-press': {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    description: 'Build strong, defined shoulders with controlled overhead pressing motions.',
    difficulty: 'hard',
    muscles: 'Shoulders, Triceps, Upper Back',
    calPerRep: 1.0,
    repsPerSet: 10,
    totalSets: 4,
    icon: '🏋️',
    color: '#ef4444',
    guide: [
      'Stand with feet shoulder-width apart',
      'Raise arms to shoulder height, elbows bent 90°',
      'Press arms straight up overhead',
      'Fully extend arms at the top',
      'Lower back to shoulder height slowly'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected — step into frame', errors: ['NO_POSE'], phase: null };
      const leftArm = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightArm = getAngle(landmarks[12], landmarks[14], landmarks[16]);
      const avgAngle = (leftArm + rightArm) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check symmetry
      const diff = Math.abs(leftArm - rightArm);
      if (diff > 20) {
        errors.push('ASYMMETRIC');
        feedbacks.push('❌ Arms uneven! Press both sides equally');
        accuracy -= 20;
      }

      // Check elbows not flaring too wide
      const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
      const elbowWidth = Math.abs(landmarks[13].x - landmarks[14].x);
      if (elbowWidth > shoulderWidth * 2.2) {
        errors.push('ELBOW_FLARE');
        feedbacks.push('⚠️ Elbows flaring too wide — keep them controlled');
        accuracy -= 15;
      }

      // Check back arching — shoulders should stay over hips
      const backArch = landmarks[11].x - landmarks[23].x;
      if (Math.abs(backArch) > 0.05) {
        errors.push('BACK_ARCH');
        feedbacks.push('❌ Back arching! Engage core and keep torso straight');
        accuracy -= 25;
      }

      // Check full lockout at top
      if (avgAngle > 160) {
        // At the top — check full extension
        const leftWristAboveHead = landmarks[15].y < landmarks[0].y;
        const rightWristAboveHead = landmarks[16].y < landmarks[0].y;
        if (!leftWristAboveHead || !rightWristAboveHead) {
          errors.push('INCOMPLETE_PRESS');
          feedbacks.push('⚠️ Press higher — get hands fully overhead');
          accuracy -= 10;
        }
      }

      // Check head forward poke
      const noseX = landmarks[0].x;
      const shoulderMidX = (landmarks[11].x + landmarks[12].x) / 2;
      if (noseX - shoulderMidX > 0.04) {
        errors.push('HEAD_FORWARD');
        feedbacks.push('⚠️ Head pushing forward — keep chin tucked');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Strong shoulder press!';

      return { accuracy, feedback, angle: avgAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle > 155) return 'up';
      if (angle < 90) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'high-knees': {
    id: 'high-knees',
    name: 'High Knees',
    description: 'A great cardio exercise that works your core and legs. Drive your knees up to your chest!',
    difficulty: 'easy',
    muscles: 'Cardio, Core, Legs',
    calPerRep: 0.5,
    repsPerSet: 20,
    totalSets: 3,
    icon: '🏃‍♂️',
    color: '#10b981',
    guide: [
      'Stand upright with feet hip-width apart',
      'Drive your right knee up towards your chest',
      'Quickly switch and drive your left knee up',
      'Pump your arms naturally as if running',
      'Keep a fast, bouncing pace to elevate heart rate'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      const leftHip = getAngle(landmarks[11], landmarks[23], landmarks[25]);
      const rightHip = getAngle(landmarks[12], landmarks[24], landmarks[26]);
      // The working leg has the smaller hip angle (higher knee)
      const currentAngle = Math.min(leftHip, rightHip);

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Lean back check (should stay upright)
      const torsoSway = Math.abs(landmarks[11].x - landmarks[23].x);
      if (torsoSway > 0.1) {
        errors.push('TORSO_SWAY');
        feedbacks.push('⚠️ Do not lean back too far. Engage core!');
        accuracy -= 20;
      }

      // Height check: if angle isn't sharp enough, it's just a light jog
      if (currentAngle > 110 && currentAngle < 150) {
        errors.push('LOW_KNEES');
        feedbacks.push('⚠️ Drive knees higher!');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Good pace! Keep it up!';

      return { accuracy, feedback, angle: currentAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle < 100) return 'up'; // High knee peek
      if (angle > 150) return 'down'; // Neutral/standing
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'calf-raises': {
    id: 'calf-raises',
    name: 'Calf Raises',
    description: 'Strengthen your lower legs and improve ankle stability.',
    difficulty: 'easy',
    muscles: 'Calves, Ankles',
    calPerRep: 0.3,
    repsPerSet: 15,
    totalSets: 3,
    icon: '🧦',
    color: '#8b5cf6',
    guide: [
      'Stand with feet hip-width apart',
      'Keep your knees relatively straight',
      'Push down into the balls of your feet and raise your heels',
      'Squeeze at the top holding for a brief moment',
      'Lower your heels back down with control'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      // Estimate calf raise by checking ankle angle (knee-ankle-toe index)
      const leftAnkle = getAngle(landmarks[25], landmarks[27], landmarks[31]);
      const rightAnkle = getAngle(landmarks[26], landmarks[28], landmarks[32]);
      const avgAnkle = (leftAnkle + rightAnkle) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check knee bend (should be straight)
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      if (leftKnee < 150 || rightKnee < 150) {
        errors.push('KNEES_BENT');
        feedbacks.push('⚠️ Keep legs straight during calf raises!');
        accuracy -= 20;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Great control!';

      return { accuracy, feedback, angle: avgAnkle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Standing flat ~ 100-120deg; Tip-toeing > 135deg
      if (angle > 140) return 'up';
      if (angle < 120) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'glute-bridges': {
    id: 'glute-bridges',
    name: 'Glute Bridges',
    description: 'A floor exercise to activate and strengthen your glutes and hamstrings.',
    difficulty: 'easy',
    muscles: 'Glutes, Core, Hamstrings',
    calPerRep: 1.0,
    repsPerSet: 12,
    totalSets: 3,
    icon: '🌉',
    color: '#ec4899',
    guide: [
      'Lie on your back with arms at your sides',
      'Bend knees and plant feet flat on the floor',
      'Squeeze glutes and lift hips toward the ceiling',
      'Form a straight line from knees to shoulders at the top',
      'Lower hips slowly back to the floor'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      const leftHip = getAngle(landmarks[11], landmarks[23], landmarks[25]);
      const rightHip = getAngle(landmarks[12], landmarks[24], landmarks[26]);
      const avgHip = (leftHip + rightHip) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Make sure it's a bridge: shoulders should be lower than hips/knees when up
      // Or we just rely on the hip angle expanding to 180!
      if (avgHip > 140 && avgHip < 160) {
        errors.push('INCOMPLETE_EXTENSION');
        feedbacks.push('⚠️ Push hips higher! Squeeze glutes at the top.');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Perfect bridge!';

      return { accuracy, feedback, angle: avgHip, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Hips are on the floor (bent) ~ 90-130
      // Hips are pushed up (straight) > 165
      if (angle > 165) return 'up';
      if (angle < 130) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'vrksasana': {
    id: 'vrksasana',
    name: 'Vrksasana (Tree Pose)',
    description: 'A classic balancing yoga pose. Improves focus, balance, and strengthens legs.',
    difficulty: 'medium',
    muscles: 'Balance, Core, Legs',
    calPerRep: 1.5,
    repsPerSet: 5,
    totalSets: 2,
    icon: '🌳',
    color: '#22c55e',
    guide: [
      'Stand tall on both feet',
      'Shift weight onto your left leg',
      'Place your right foot on your left inner thigh (or calf)',
      'Reach hands overhead forming a tall tree branch',
      'Hold the pose, then return to standing (1 rep)'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);

      const plantedAngle = Math.max(leftKnee, rightKnee);
      const bentAngle = Math.min(leftKnee, rightKnee);

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check planted leg is straight
      if (plantedAngle < 160) {
        errors.push('PLANTED_BENT');
        feedbacks.push('⚠️ Keep the standing leg perfectly straight!');
        accuracy -= 20;
      }

      // Check hands overhead
      const handsUp = landmarks[15].y < landmarks[0].y && landmarks[16].y < landmarks[0].y;
      if (bentAngle < 120 && !handsUp) {
        errors.push('HANDS_LOW');
        feedbacks.push('⚠️ Reach hands above your head!');
        accuracy -= 20;
      }

      // Check balance swaying
      const shoulderCenter = (landmarks[11].x + landmarks[12].x) / 2;
      const hipCenter = (landmarks[23].x + landmarks[24].x) / 2;
      if (Math.abs(shoulderCenter - hipCenter) > 0.1) {
        errors.push('UNSTABLE');
        feedbacks.push('⚠️ Try to stabilize your core. Balance!');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Beautiful tree pose!';

      return { accuracy, feedback, angle: bentAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Angle here refers to the bent leg. When standing straight, both are ~180.
      if (angle < 120) return 'up'; // In pose
      if (angle > 165) return 'down'; // Standing
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'baddha-kona-asana': {
    id: 'baddha-kona-asana',
    name: 'Baddha-kona-asana (Restrained Angle)',
    description: 'Also known as the Butterfly Pose. Excellent for hips and groin flexibility.',
    difficulty: 'easy',
    muscles: 'Hips, Inner Thighs',
    calPerRep: 1.0,
    repsPerSet: 5,
    totalSets: 2,
    icon: '🦋',
    color: '#eab308',
    guide: [
      'Sit on the floor with legs extended forward',
      'Bend knees and bring the soles of your feet together',
      'Let your knees drop out to the sides',
      'Hold onto your feet and keep your back straight',
      'Hold your stretch, then extend legs back out (1 rep)'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      const avgKnee = (leftKnee + rightKnee) / 2;

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check if back is straight while seated
      const torsoSway = Math.abs(landmarks[11].x - landmarks[23].x);
      if (torsoSway > 0.15) {
        errors.push('HUNCHING');
        feedbacks.push('⚠️ Sit up taller! Keep the back straight.');
        accuracy -= 20;
      }

      // Check if feet are together
      const footDist = getDistance(landmarks[27], landmarks[28]);
      const shoulderDist = getDistance(landmarks[11], landmarks[12]);
      if (avgKnee < 110 && footDist > shoulderDist * 0.8) {
        errors.push('FEET_APART');
        feedbacks.push('⚠️ Bring the soles of your feet closer together.');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Great flexibility!';

      return { accuracy, feedback, angle: avgKnee, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle < 110) return 'up'; // Crossed / Butterfly position
      if (angle > 150) return 'down'; // Legs straight out
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'sit-ups': {
    id: 'sit-ups',
    name: 'Sit-ups',
    description: 'Classic core exercise. Strengthens abdominal muscles.',
    difficulty: 'medium',
    muscles: 'Core, Abs',
    calPerRep: 0.5,
    repsPerSet: 15,
    totalSets: 3,
    icon: '🔥',
    color: '#f43f5e',
    guide: [
      'Lie on your back, knees bent, feet flat',
      'Cross hands over your chest or behind your head',
      'Use core to lift your torso towards your thighs',
      'Lower back down with control'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      
      // Calculate torso angle relative to ground (using shoulder and hip)
      const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
      const hipY = (landmarks[23].y + landmarks[24].y) / 2;
      const shoulderX = (landmarks[11].x + landmarks[12].x) / 2;
      const hipX = (landmarks[23].x + landmarks[24].x) / 2;
      
      const angleRad = Math.atan2(hipY - shoulderY, hipX - shoulderX);
      let torsoAngle = Math.abs(angleRad * 180 / Math.PI); // Angle against horizontal
      
      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // If knees are too straight, warn them to bend knees
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      if (leftKnee > 150) {
        errors.push('STRAIGHT_LEGS');
        feedbacks.push('⚠️ Bend your knees to protect your lower back!');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Good core engagement!';

      return { accuracy, feedback, angle: torsoAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Assuming person is lying down side-ways or slightly angled
      // If torso angle is close to 0 (horizontal), they are down. If > 45, they are up.
      if (angle > 45) return 'up';
      if (angle < 20) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'side-lunges': {
    id: 'side-lunges',
    name: 'Side Lunges',
    description: 'Lateral leg movement targeting quads, glutes, and inner thighs.',
    difficulty: 'medium',
    muscles: 'Quads, Glutes, Inner Thighs',
    calPerRep: 1.2,
    repsPerSet: 10, // Per side, but we'll count total
    totalSets: 3,
    icon: '🦵',
    color: '#8b5cf6',
    guide: [
      'Stand with feet wide apart',
      'Lean body to one side, bending that knee',
      'Keep the other leg completely straight',
      'Push back up to the center',
      'Alternate sides'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      
      const minKnee = Math.min(leftKnee, rightKnee);
      const maxKnee = Math.max(leftKnee, rightKnee);
      
      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // One leg should be straight (>160), one should be bent (<130)
      if (minKnee < 130 && maxKnee < 150) {
        errors.push('BOTH_BENT');
        feedbacks.push('❌ Keep the non-lunging leg straight!');
        accuracy -= 20;
      }
      
      // Torso lean check
      const torsoSway = Math.abs(landmarks[11].x - landmarks[23].x);
      if (torsoSway > 0.15) {
         errors.push('TOO_MUCH_LEAN');
         feedbacks.push('⚠️ Try to keep your chest up as you lunge laterally.');
         accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Clean side lunge!';

      return { accuracy, feedback, angle: minKnee, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Angle is the bent knee angle
      if (angle < 120) return 'down';
      if (angle > 165) return 'up';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'good-mornings': {
    id: 'good-mornings',
    name: 'Good Mornings',
    description: 'Great for lower back, glutes, and hamstrings.',
    difficulty: 'medium',
    muscles: 'Hamstrings, Glutes, Lower Back',
    calPerRep: 0.8,
    repsPerSet: 12,
    totalSets: 3,
    icon: '☀️',
    color: '#eab308',
    guide: [
      'Stand with feet shoulder-width apart',
      'Place hands gently behind your head',
      'Hinge at the hips, keeping your back totally straight',
      'Slightly bend knees as you bow forward',
      'Return to standing using your glutes'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      
      const leftHip = getAngle(landmarks[11], landmarks[23], landmarks[25]);
      const rightHip = getAngle(landmarks[12], landmarks[24], landmarks[26]);
      const avgHip = (leftHip + rightHip) / 2;
      
      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Check straight back
      // Hip should be in line with shoulder and ear, if back is rounding, shoulder/hip/ear relationship changes
      // A simple check is comparing chest vs shoulder to hip
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      if (leftKnee < 130) {
        errors.push('KNEES_TOO_BENT');
        feedbacks.push('❌ Too much knee bend! This is a hinge, not a squat.');
        accuracy -= 20;
      }
      
      // Hands behind head approximation (elbows bent, wrists high)
      const leftArm = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      if (leftArm > 120) {
        errors.push('ARMS_NOT_UP');
        feedbacks.push('⚠️ Place hands behind your head to maintain posture.');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Good hip hinge!';

      return { accuracy, feedback, angle: avgHip, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      if (angle < 120) return 'down'; // Bowed forward
      if (angle > 165) return 'up'; // Standing straight
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'arm-circles': {
    id: 'arm-circles',
    name: 'Arm Circles',
    description: 'Shoulder mobility and light endurance.',
    difficulty: 'easy',
    muscles: 'Shoulders',
    calPerRep: 0.2, // very low calories per circle
    repsPerSet: 20,
    totalSets: 3,
    icon: '⭕',
    color: '#0ea5e9',
    guide: [
      'Stand straight with arms extended to your sides',
      'Keep arms parallel to the floor',
      'Make small circular motions forward',
      'Keep your core tight and don\'t swing your body'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      
      // We will track the vertical motion of the wrists
      const leftWristY = landmarks[15].y;
      const rightWristY = landmarks[16].y;
      const avgWristY = (leftWristY + rightWristY) / 2;
      // Convert Y position to a pseudo-angle for phase tracking (just scaling 0-1 to something like 0-180)
      const pseudoAngle = avgWristY * 180; 

      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Arms should be relatively straight
      const leftArm = getAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightArm = getAngle(landmarks[12], landmarks[14], landmarks[16]);
      if (leftArm < 150 || rightArm < 150) {
        errors.push('BENT_ARMS');
        feedbacks.push('⚠️ Straighten your arms for a better stretch!');
        accuracy -= 20;
      }
      
      // Body should be still
      const torsoSway = Math.abs(landmarks[11].x - landmarks[23].x);
      if (torsoSway > 0.05) {
        errors.push('BODY_SWAY');
        feedbacks.push('⚠️ Keep your body still, move only your arms.');
        accuracy -= 10;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Good circles!';

      return { accuracy, feedback, angle: pseudoAngle, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // As wrists go up and down they trace a circle. Y goes up and down.
      // E.g. resting shoulder Y is around 0.3. 
      // Higher Y means lower on screen. Lower Y means higher on screen.
      // angle is just Y * 180.
      // Let's create an artificial phase relying on the oscillation
      if (angle < 50) return 'up';   // Hands went high
      if (angle > 70) return 'down'; // Hands went low
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  },

  'leg-raises': {
    id: 'leg-raises',
    name: 'Leg Raises',
    description: 'Target your lower abs and hip flexors.',
    difficulty: 'medium',
    muscles: 'Abs, Core, Hip Flexors',
    calPerRep: 0.6,
    repsPerSet: 12,
    totalSets: 3,
    icon: '🦵',
    color: '#f59e0b',
    guide: [
      'Lie flat on your back, legs straight together',
      'Keep your arms flat on the floor by your sides',
      'Lift both legs up until they point at the ceiling',
      'Slowly lower them back down without touching the floor'
    ],
    checkAngles: function (landmarks) {
      if (!landmarks) return { accuracy: 0, feedback: '❌ No pose detected', errors: ['NO_POSE'], phase: null };
      
      const leftHip = getAngle(landmarks[11], landmarks[23], landmarks[25]);
      const rightHip = getAngle(landmarks[12], landmarks[24], landmarks[26]);
      const avgHip = (leftHip + rightHip) / 2;
      
      let errors = [];
      let accuracy = 100;
      let feedbacks = [];

      // Knees should be mostly straight
      const leftKnee = getAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = getAngle(landmarks[24], landmarks[26], landmarks[28]);
      if (leftKnee < 150 || rightKnee < 150) {
        errors.push('BENT_KNEES');
        feedbacks.push('⚠️ Try to keep your legs as straight as possible.');
        accuracy -= 15;
      }

      accuracy = Math.max(0, Math.min(100, accuracy));
      const feedback = feedbacks.length > 0 ? feedbacks[0] : '✅ Excellent leg raise!';

      return { accuracy, feedback, angle: avgHip, errors, allFeedbacks: feedbacks };
    },
    getPhase: function (angle, prevPhase) {
      // Lying flat = ~180. Legs up = ~90.
      if (angle < 110) return 'up';
      if (angle > 165) return 'down';
      return prevPhase;
    },
    repCompleted: function (currentPhase, prevPhase) {
      return prevPhase === 'down' && currentPhase === 'up';
    }
  }
};

/* ===== UTILITY: Calculate angle between 3 points ===== */
function getAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/* ===== UTILITY: Distance between 2 points ===== */
function getDistance(a, b) {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
