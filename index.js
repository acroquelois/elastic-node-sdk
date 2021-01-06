const { Client, Serializer } = require('@elastic/elasticsearch')

const client = new Client({
    node: 'http://localhost:9200',
})


const request1 = client.search({
        index: 'person',
        body: {
            query: {
                match: {gender: 'female'}
            }
        }
    })
const request2 = client.search({
        index: 'person',
        body: {
            query: { range: { age: { gte: 20} }}
        }
    })
const request3 = client.search({
    index: 'person',
    body: {
        query: {
            bool: {
                must: [
                    { match: { gender: "male"}},
                    { range: { age: { gte: 20}}}
                ]
            }
        }
    }
})
const request4 = client.search({
    index: 'person',
    body: {
        size: 0,
        aggs: {
            avg_field: {
                avg: {
                    field: "age"
                }
            }
        }
    }
})

const request5 = client.search({
    index: 'person',
    body: {
        size: 0,
        aggs: {
            genre: {
                terms: {
                    field: 'gender'
                }
            }
        }
    }
})

const request6 = client.search({
    index: 'person',
    body: {
        size: 0,
        aggs: {
            genre: {
                terms: {
                    field: "gender"
                },
                aggs: {
                    eye: {
                        terms: {
                            field: "eyeColor"
                        }
                    }
                }
            }
        }
    }
})

const request7 = client.search({
    index: 'person',
    body: {
        size: 0,
        aggs: {
            genre: {
                terms: {
                    field: "gender"
                },
                aggs: {
                    anne:{
                        date_histogram: {
                            field: "registered",
                            interval: "year"
                        }
                    }
                }
            }
        }
    }
})

const request8 = client.search({
    index: 'person',
    body: {
        query: {
            bool: {
                must: [
                    { range: { age: { gte: 20} }},
                    { range: { amout: { gte: 1000, lte: 2000 }}}
                ]
            }
        }
    }
})

const request9 = client.search({
    index: 'person',
    body: {
        query: {
            bool: {
                must: {
                    match_all: {}
                },
                filter: {
                    geo_distance: {
                        distance: "10km",
                        location: {
                            lat: 48.8534,
                            lon: 2.3488
                        }
                    }
                }
            }
        }
    }
})


function formatRequest5(bucket){
    let res = ''
    bucket.forEach((elem) => {
        res += `|${elem.key} : ${elem.doc_count}|`
    })
    return res
}

function formatRequest6(bucket){
    let res = ''
    bucket.forEach((elem) => {
        res += `[${elem.key}:`
        elem.eye.buckets.forEach((elem1) =>{
            res += `|${elem1.key} : ${elem1.doc_count}|`
        })
        res += `]`
    })
    return res
}

function formatRequest7(bucket){
    let res = ''
    bucket.forEach((elem) => {
        res += `[${elem.key}:`
        elem.anne.buckets.forEach((elem1) =>{
            res += `|${elem1.key_as_string.substring(0,4)} : ${elem1.doc_count}|`
        })
        res += `]`
    })
    return res
}

request1
    .then(result => console.log(`* ${result.body.hits.total.value} personnes sont des femmes`))
    .catch(err => console.log(err))
request2
    .then(result => console.log(`* ${result.body.hits.total.value} personnes ont plus de 20 ans`))
    .catch(err => console.log(err))
request3
    .then(result => console.log(`* ${result.body.hits.total.value} hommes ont plus de 20 ans`))
    .catch(err => console.log(err))
request4
    .then(result => console.log(`* Moyenne d'age: ${result.body.aggregations.avg_field.value} ans`))
    .catch(err => console.log(err))
request5
    .then(result => console.log(`* Nombre de personne par genre:\n ${formatRequest5(result.body.aggregations.genre.buckets)}`))
    .catch(err => console.log(err))
request6
    .then(result => console.log(`* Nombre de personne par genre et par couleur de yeux:\n ${formatRequest6(result.body.aggregations.genre.buckets)}`))
    .catch(err => console.log(err))
request7
    .then(result => console.log(`* Nombre de personne par genre et par annee d'enregistrement:\n ${formatRequest7(result.body.aggregations.genre.buckets)}`))
    .catch(err => console.log(err))
request8
    .then(result => console.log(`* Nombre de personne qui ont plus de 20ans et dont le balance est comprise entre 1000 et 2000:\n ${result.body.hits.total.value}`))
    .catch(err => console.log(err))
request9
    .then(result => console.log(`* Nombre de personne qui sont à 10km de Paris:\n ${result.body.hits.total.value}`))
    .catch(err => console.log(err))