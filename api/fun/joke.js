const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "Why did the web developer break up with the server? It was a one-way relationship.",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
    "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
    "What's a programmer's favorite hangout place? Foo Bar."
];

module.exports = {
    meta: {
        name: 'Joke',
        path: '/fun/joke',
        method: 'GET',
        description: 'Get a random programming joke.',
        params: {}
    },
    handler: (req, res) => {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        res.json({
            joke: randomJoke
        });
    }
};