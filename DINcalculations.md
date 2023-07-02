# DIN Colosion Calculations

## Concern
We were concerned that the DIN could be used to generate a collision.

## Calculations
To calculate the maximum possible unique configurations given 72 characters and 5 "digits," we can use the concept of permutations.

In this case, we have 72 characters available and we want to select 5 of them for our configuration. The order of selection matters, and repetitions are not allowed. Therefore, we can use the formula for permutations:

`P(n, r) = n! / (n - r)!`

where P(n, r) represents the number of permutations of n items taken r at a time.

Plugging in the values, we have:

`P(72, 5) = 72! / (72 - 5)!`


This provides us with  a possible: 1,678,985,280 (1.6 billion uniqe configurations)

## Conclusion
When the din is concatted with a password, the number of permutation is multipled by the number of passwords. 
At a minimum there is ***1 and a trillion*** chances of a collision after hashing.


ref:

https://www.khanacademy.org/math/statistics-probability/counting-permutations-and-combinations/permutation-lib/v/permutation-formula

