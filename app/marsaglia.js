function MarsagliaRandom(seed) {
	this.state = seed || 0xCAFEBABE;
	/*********************************************************************************************
	  George Marsaglia
	  ----------------
	  -- From Wikipedia, the free encyclopedia --
	  Born 				March 12, 1924
	  Died 				February 15, 2011 (aged 86)
	  Nationality 		American
	  Fields 			Mathematics
	  Institutions 		Florida State University
						Washington State University
	  Alma mater 		Ohio State University
	  Doctoral advisor 	Henry Mann

		George Marsaglia (March 12, 1924 – February 15, 2011) was an American mathematician and 
		computer scientist. He established the lattice structure of congruential random number 
		generators in the paper "Random numbers fall mainly in the planes".	This phenomenon is 
		sometimes called the Marsaglia effect. He also developed the so-called 	"diehard tests", 
		a series of tests to determine whether or not a sequence of numbers have the statistical 
		properties that could be expected from a random sequence. In 1995 he published a CD-ROM 
		of random numbers which included the diehard tests.

		He is also known for developing some of the most commonly used methods for generating 
		random numbers and using them to produce random samples from various distributions. Some 
		of the most widely used being the multiply-with-carry, subtract-with-borrow, Xorshift, 
		KISS and Mother methods for random numbers, and the ziggurat algorithm for generating 
		normally or other unimodally distributed random variables.

		He was Professor Emeritus of Pure and Applied Mathematics and Computer Science at 
		Washington State University and Professor Emeritus of Statistics at Florida State 
		University.

		Marsaglia died of a heart attack on February 15, 2011, in Tallahassee.
	*********************************************************************************************/

	this.nextLong = () => {
		let a = this.state;
		this.state = this.xorShift64(a);
		return a;
	}

	this.xorShift64 = (a) => {
		let b = a;
		b ^= (b << 21);
		b ^= (b >> 35);
		b ^= (b << 4);
		return b;
	}

	this.random = (max) => {
		const next = this.nextLong()
		const result = Math.abs(((next>>32)*max)>>32) % max;
		//console.log('Rando next: ' + next + ' ret: ' + result + '/' + max);
		return result;
	}
}
export default MarsagliaRandom;