class Guitar extends Instrument {
    constructor() {
        super('Guitar');
    }
    
    init() {
        this.createGuitarControls();
        // Instead of adding a class, set the background color directly.
        document.body.style.backgroundColor = '#8B4513';
    }
    
    createGuitarControls() {
        /* Create Guitar specific controls */
        document.querySelector('.wave-selector').style.display = 'none';
        var controlBar = document.querySelector('.control-bar');
        
        /* Add Guitar specific controls */
        var guitarControls = document.createElement('div');
        guitarControls.id = 'guitar-controls';
        guitarControls.style.display = 'inline-flex';
        guitarControls.style.marginLeft = '10px';
        
        /* Guitar Type control */
        var typeGroup = document.createElement('div');
        typeGroup.className = 'control-group';
        typeGroup.style.marginRight = '10px';
        
        var typeLabel = document.createElement('label');
        typeLabel.textContent = 'Type';
        typeLabel.style.marginBottom = '5px';
        typeLabel.style.fontSize = '0.8em';
        
        var typeSelect = document.createElement('select');
        typeSelect.id = 'guitar-type';
        typeSelect.style.width = '120px';
        
        var acousticOption = document.createElement('option');
        acousticOption.value = 'acoustic';
        acousticOption.textContent = 'Acoustic';
        typeSelect.appendChild(acousticOption);
        
        var electricOption = document.createElement('option');
        electricOption.value = 'electric';
        electricOption.textContent = 'Electric';
        typeSelect.appendChild(electricOption);
        
        var bassOption = document.createElement('option');
        bassOption.value = 'bass';
        bassOption.textContent = 'Bass';
        typeSelect.appendChild(bassOption);
        
        typeGroup.appendChild(typeLabel);
        typeGroup.appendChild(typeSelect);
        
        /* Damping control */
        var dampingGroup = document.createElement('div');
        dampingGroup.className = 'control-group';
        dampingGroup.style.marginRight = '10px';
        
        var dampingLabel = document.createElement('label');
        dampingLabel.textContent = 'Damping';
        dampingLabel.id = 'guitar-damping-label';
        dampingLabel.style.marginBottom = '5px';
        dampingLabel.style.fontSize = '0.8em';
        
        var dampingSlider = document.createElement('input');
        dampingSlider.type = 'range';
        dampingSlider.id = 'guitar-damping';
        dampingSlider.min = '0.9';
        dampingSlider.max = '0.999';
        dampingSlider.step = '0.001';
        dampingSlider.value = '0.995';
        dampingSlider.style.width = '100px';
        
        dampingSlider.addEventListener('input', function() {
            document.getElementById('guitar-damping-label').textContent = 'Damping';
        });
        
        dampingGroup.appendChild(dampingLabel);
        dampingGroup.appendChild(dampingSlider);
        
        /* Body Resonance control */
        var resonanceGroup = document.createElement('div');
        resonanceGroup.className = 'control-group';
        
        var resonanceLabel = document.createElement('label');
        resonanceLabel.textContent = 'Body';
        resonanceLabel.id = 'guitar-body-label';
        resonanceLabel.style.marginBottom = '5px';
        resonanceLabel.style.fontSize = '0.8em';
        
        var resonanceSlider = document.createElement('input');
        resonanceSlider.type = 'range';
        resonanceSlider.id = 'guitar-body';
        resonanceSlider.min = '0';
        resonanceSlider.max = '1';
        resonanceSlider.step = '0.01';
        resonanceSlider.value = '0.3';
        resonanceSlider.style.width = '100px';
        
        resonanceSlider.addEventListener('input', function() {
            document.getElementById('guitar-body-label').textContent = 'Body';
        });
        
        resonanceGroup.appendChild(resonanceLabel);
        resonanceGroup.appendChild(resonanceSlider);
        
        guitarControls.appendChild(typeGroup);
        guitarControls.appendChild(dampingGroup);
        guitarControls.appendChild(resonanceGroup);
        
        controlBar.appendChild(guitarControls);
    }

    removeGuitarControls() {
        var guitarControls = document.getElementById('guitar-controls');
        if (guitarControls) {
            guitarControls.parentNode.removeChild(guitarControls);
        }
        
        document.querySelector('.wave-selector').style.display = 'inline-flex';
    }
    
    playNote(note, freq) {
        if (!window.audioContext) return;
        
        try {
            var now = window.audioContext.currentTime;
            var gainValue = 0.25;

            /* Get Guitar specific parameters */
            var typeSelect = document.getElementById('guitar-type');
            var dampingSlider = document.getElementById('guitar-damping');
            var bodySlider = document.getElementById('guitar-body');
            
            var guitarType = typeSelect ? typeSelect.value : 'acoustic';
            var damping = dampingSlider ? parseFloat(dampingSlider.value) : 0.995;
            var bodyResonance = bodySlider ? parseFloat(bodySlider.value) : 0.3;

            /* Create main oscillator for the note */
            var oscillator = window.audioContext.createOscillator();
            var gainNode = window.audioContext.createGain();
            
            /* Create additional oscillators for harmonics */
            var harmonic1 = window.audioContext.createOscillator();
            var harmonic2 = window.audioContext.createOscillator();
            var harmonicGain1 = window.audioContext.createGain();
            var harmonicGain2 = window.audioContext.createGain();
            
            /* Create filter for guitar body resonance */
            var filter = window.audioContext.createBiquadFilter();
            
            /* Create a pluck noise for attack */
            var pluckNoise = window.audioContext.createBufferSource();
            var pluckBuffer = window.audioContext.createBuffer(1, window.audioContext.sampleRate * 0.05, window.audioContext.sampleRate);
            var pluckData = pluckBuffer.getChannelData(0);
            for (var i = 0; i < pluckBuffer.length; i++) {
                pluckData[i] = (Math.random() * 2 - 1) * 0.2; /* Reduced pluck noise */
            }
            pluckNoise.buffer = pluckBuffer;
            var pluckGain = window.audioContext.createGain();
            
            /* Configure main oscillator */
            oscillator.type = 'sawtooth';
            var roundedFreq = Math.round(freq * 1000) / 1000;
            oscillator.frequency.setValueAtTime(roundedFreq, now);
            
            /* Configure harmonics with reduced gain */
            harmonic1.type = 'sine';
            harmonic1.frequency.setValueAtTime(roundedFreq * 2, now); /* Octave */
            harmonicGain1.gain.value = 0.1;
            
            harmonic2.type = 'sine';
            harmonic2.frequency.setValueAtTime(roundedFreq * 3, now); /* Fifth */
            harmonicGain2.gain.value = 0.08;
            
            /* Configure filter based on guitar type */
            if (guitarType === 'acoustic') {
                filter.type = 'lowpass';
                filter.frequency.value = roundedFreq * 2.5;
                filter.Q.value = 1;
            } else if (guitarType === 'electric') {
                filter.type = 'lowpass';
                filter.frequency.value = roundedFreq * 4;
                filter.Q.value = 2;
            } else if (guitarType === 'bass') {
                filter.type = 'lowpass';
                filter.frequency.value = roundedFreq * 1.5;
                filter.Q.value = 0.8;
            }
            
            /* Connect the audio graph */
            oscillator.connect(gainNode);
            harmonic1.connect(harmonicGain1);
            harmonic2.connect(harmonicGain2);
            harmonicGain1.connect(gainNode);
            harmonicGain2.connect(gainNode);
            
            /* Connect pluck noise for attack */
            pluckNoise.connect(pluckGain);
            pluckGain.connect(filter);
            
            gainNode.connect(filter);
            filter.connect(window.mainGainNode);
            
            /* --- ADSR Envelope --- */
            /* Quick attack with pluck noise */
            pluckGain.gain.setValueAtTime(0.1, now); /* Reduced pluck gain */
            pluckGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(gainValue * 0.6, now + 0.01);
            
            /* Start the sound */
            oscillator.start(now);
            harmonic1.start(now);
            harmonic2.start(now);
            pluckNoise.start(now);
            
            window.activeOscillators[note] = { 
                oscillator: oscillator, 
                gainNode: gainNode,
                harmonic1: harmonic1,
                harmonic2: harmonic2,
                harmonicGain1: harmonicGain1,
                harmonicGain2: harmonicGain2,
                filter: filter,
                pluckNoise: pluckNoise,
                pluckGain: pluckGain
            };
            
            if(DEBUG) {
                console.log("Guitar Note started:", note, "Frequency:", roundedFreq);
            }
        } catch (e) {
            console.error("Error playing guitar note:", e);
        }
    }
    
    stopNote(note) {
        var oscillatorData = window.activeOscillators[note];
        
        if (!oscillatorData) {
            if(DEBUG) {
                console.log("Guitar note data missing:", note, oscillatorData);
            }
            delete window.activeOscillators[note];
            return;
        }
        
        try {
            var now = window.audioContext.currentTime;
            var releaseTime = 0.3;
            
            /* Stop all components */
            if (oscillatorData.oscillator) {
                try {
                    oscillatorData.oscillator.stop(now + releaseTime);
                } catch (e) {
                    /* Ignore errors */
                }
            }
            
            if (oscillatorData.harmonic1) {
                try {
                    oscillatorData.harmonic1.stop(now + releaseTime);
                } catch (e) {
                    /* Ignore errors */
                }
            }
            
            if (oscillatorData.harmonic2) {
                try {
                    oscillatorData.harmonic2.stop(now + releaseTime);
                } catch (e) {
                    /* Ignore errors */
                }
            }
            
            if (oscillatorData.pluckNoise) {
                try {
                    oscillatorData.pluckNoise.stop(now + 0.01);
                } catch (e) {
                    /* Ignore errors */
                }
            }
            
            /* Fade out gains */
            if (oscillatorData.gainNode) {
                oscillatorData.gainNode.gain.cancelScheduledValues(now);
                oscillatorData.gainNode.gain.setValueAtTime(oscillatorData.gainNode.gain.value, now);
                oscillatorData.gainNode.gain.exponentialRampToValueAtTime(0.01, now + releaseTime);
            }
            
            if (oscillatorData.harmonicGain1) {
                oscillatorData.harmonicGain1.gain.cancelScheduledValues(now);
                oscillatorData.harmonicGain1.gain.setValueAtTime(oscillatorData.harmonicGain1.gain.value, now);
                oscillatorData.harmonicGain1.gain.linearRampToValueAtTime(0, now + releaseTime);
            }
            
            if (oscillatorData.harmonicGain2) {
                oscillatorData.harmonicGain2.gain.cancelScheduledValues(now);
                oscillatorData.harmonicGain2.gain.setValueAtTime(oscillatorData.harmonicGain2.gain.value, now);
                oscillatorData.harmonicGain2.gain.linearRampToValueAtTime(0, now + releaseTime);
            }
            
            if (oscillatorData.pluckGain) {
                oscillatorData.pluckGain.gain.cancelScheduledValues(now);
                oscillatorData.pluckGain.gain.setValueAtTime(oscillatorData.pluckGain.gain.value, now);
                oscillatorData.pluckGain.gain.linearRampToValueAtTime(0, now + 0.01);
            }
            
            /* Remove from active oscillators immediately */
            delete window.activeOscillators[note];
            
            if(DEBUG) {
                console.log("Guitar Note stopped:", note);
            }
        } catch (e) {
            console.error("Error stopping guitar note:", e);
            /* Still remove from active oscillators even if stopping failed */
            delete window.activeOscillators[note];
        }
    }
    
    export(context, note, startTime, duration, destination) {
        var typeSelect = document.getElementById('guitar-type');
        var dampingSlider = document.getElementById('guitar-damping');
        var bodySlider = document.getElementById('guitar-body');
        
        var guitarType = typeSelect ? typeSelect.value : 'acoustic';
        var bodyResonance = bodySlider ? parseFloat(bodySlider.value) : 0.3;

        var oscillator = context.createOscillator();
        var gainNode = context.createGain();
        var filter = context.createBiquadFilter();
        
        // Create a pluck noise for attack
        var pluckNoise = context.createBufferSource();
        var pluckBuffer = context.createBuffer(1, context.sampleRate * 0.05, context.sampleRate);
        var pluckData = pluckBuffer.getChannelData(0);
        for (var i = 0; i < pluckBuffer.length; i++) {
            pluckData[i] = (Math.random() * 2 - 1) * 0.2;
        }
        pluckNoise.buffer = pluckBuffer;
        var pluckGain = context.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = note.freq;
        
        // Configure filter based on guitar type
        if (guitarType === 'acoustic') {
            filter.type = 'lowpass';
            filter.frequency.value = note.freq * 2.5;
            filter.Q.value = 1;
        } else if (guitarType === 'electric') {
            filter.type = 'lowpass';
            filter.frequency.value = note.freq * 4;
            filter.Q.value = 2;
        } else if (guitarType === 'bass') {
            filter.type = 'lowpass';
            filter.frequency.value = note.freq * 1.5;
            filter.Q.value = 0.8;
        }
        
        // --- CORRECTED AUDIO ROUTING ---
        // Connect to the passed-in destination, not context.destination
        oscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(destination);

        // Connect pluck noise for attack
        pluckNoise.connect(pluckGain);
        pluckGain.connect(filter);
        
        // --- CORRECTED ENVELOPE LOGIC ---
        var attackTime = 0.001;
        var releaseTime = Math.min(duration * 0.4, 0.5);
        var sustainLevel = 0.7;

        pluckGain.gain.setValueAtTime(0.1, startTime);
        pluckGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime);
        gainNode.gain.setValueAtTime(sustainLevel, startTime + duration);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration + releaseTime);
        
        // Start the sound
        oscillator.start(startTime);
        pluckNoise.start(startTime);
        oscillator.stop(startTime + duration + releaseTime);
        pluckNoise.stop(startTime + 0.05);
    }
    
    cleanup() {
        this.removeGuitarControls();
        // Revert the background color to its default state.
        document.body.style.backgroundColor = '';
    }
}
