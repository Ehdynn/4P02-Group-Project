#include <iostream>
#include <unistd.h>
#include <cstdlib>
#include <signal.h>
#include <pthread.h>
#include <cmath>


volatile bool run; // Run condition for threads
pthread_mutex_t lock; //mutual exclusion lock
volatile int occupied; // how many active threads

// Values that are way too high
volatile double bestPossible = 1000000000; 
volatile double bestX = 1000000000;
volatile double bestY = 1000000000;
const double domainMax = 512.0;
const double domainMin = -512.0;

/**
 * Displays the current best, and stops the threads after they complete their current loop
 */
void interrupted(int sig) {
    std::cout<<std::endl<<"best possible: " << bestPossible << " bestX: " << bestX << " bestY: " << bestY <<std::endl;
    run=false;
}

/**
 * Finds the lowest value in an array
 * @param array of 4 longs
 * @return the index of the smallest value
 */
int minVal(double arr[4]){
    int min = 0;
    for(int i = 1; i < 4; i++){
        if(arr[min] > arr[i]) min = i;
    }
    return min;
}

/**
 * Computes the position given 2 coords
 * @param coord x
 * @param coord y
 * @return position
 */
double doTheMath(double x, double y){
    // Fill this in
    double ans = -(y + 47.0) * std::sin(std::sqrt(std::abs(x / 2 + y + 47.0)))
           - x * std::sin(std::sqrt(std::abs(x - y - 47.0)));
    return ans;
}

/**
 * Gives a random value within the -512 -> 512 domain
 * @return the value
 */
double randValueInDomain(){ return ((double)rand() / RAND_MAX) * (domainMax - domainMin) + domainMin;
};

/**
 * returns a random moddifier from -5 to 5 incl. 
 * @return the modifier
 */
double randModifier(){
return ((double)rand() / RAND_MAX) * (5 - (-5.0)) + (-5.0);
}

/**
 * funtion for the thread to complete, working to find local minimums
 */
void * someFunction(void * args){ 

    // threads location and coords
    double cx = randValueInDomain();
    double cy = randValueInDomain();
    double currentPos = doTheMath(cx,cy);

    while(run){
        // 4 attempts per loop
        double pos[4];
        double x[4] = {cx}; 
        double y[4] = {cy};

        // Generating the values
        for(int i = 0; i < 4; i++){
            x[i] += randModifier();
            // Clamping X
            if(x[i] > 512 ){
                x[i] = 512;
            }
            if(x[i] < -512 ){
                x[i] = -512;
            }

            y[i] += randModifier();
            // Clamping Y
            if(y[i] > 512 ){
                y[i] = 512;
            }
            if(y[i] < -512 ){
                y[i] = -512;
            }
            pos[i] = doTheMath(x[i],y[i]);
        }
        
        // Update personal
        int bestOfTries = minVal(pos);
        if(pos[bestOfTries] < currentPos){
            currentPos = pos[bestOfTries];
            cx = x[bestOfTries];
            cy = y[bestOfTries];
        } else{
            cx = randValueInDomain();
            cy = randValueInDomain();
        }
        // Updating Global
        if(currentPos < bestPossible){
            pthread_mutex_lock(&lock);
            bestPossible = currentPos;
            bestX = cx;
            bestY = cy;
            pthread_mutex_unlock(&lock);
        }
    }

    pthread_mutex_lock(&lock);
	occupied--;
	pthread_mutex_unlock(&lock);
    return nullptr;
}

int main(){
    pthread_t ct[3];//our child threads
	srand(time(NULL)); // seed time
    pthread_mutex_init(&lock,NULL);
    if (signal(SIGINT,interrupted)==SIG_ERR) {
    	    std::cout<<"Unable to change signal handler."<<std::endl;
            return 1;
    }

    while(true){
        int numClimber;
        std::cout<<"How many? ";
        std::cin>>numClimber;

        if(numClimber <= 0) break; // quit condition
        if(numClimber > 3) break; // too many threads

        run = true; // tells the threads to run

        // Make threads
        for (int i=0;i<numClimber;i++) {
            pthread_mutex_lock(&lock);//reserve lock
            pthread_create(&ct[i], NULL, &someFunction, NULL);
            occupied++;
            pthread_mutex_unlock(&lock);//release lock
        }
        
        while(occupied > 0){
            sleep(1); // Running Faster than this is kind of unccessesary
        }
    
    }
    pthread_mutex_destroy(&lock);

    return 0;

}
