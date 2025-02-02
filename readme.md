Convert final resume to Reactive Resume V3 format.

How to validate reactive resume v3 format is still unknown.

How to create a cookie with Authentication still unknown probably need to figure out from server code ?
Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNm8wYnZlMjAwMDAxMHFncDVrNWdjamkiLCJpc1R3b0ZhY3RvckF1dGgiOmZhbHNlLCJpYXQiOjE3Mzg1MzExNDksImV4cCI6MTczODUzMjA0OX0.W3riRJ71BJbZUzJq-RWrLuLtLbLnttiM_OPTHZKBj98

creating resume curl found.

curl --location 'http://localhost:3000/api/resume/import' \
--header 'Accept: application/json, text/plain, */*' \
--header 'Accept-Language: en-US,en;q=0.9' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/json' \
--header 'Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNm8wYnZlMjAwMDAxMHFncDVrNWdjamkiLCJpc1R3b0ZhY3RvckF1dGgiOmZhbHNlLCJpYXQiOjE3Mzg1MzExNDksImV4cCI6MTczODUzMjA0OX0.W3riRJ71BJbZUzJq-RWrLuLtLbLnttiM_OPTHZKBj98' \
--header 'Origin: http://localhost:3000' \
--header 'Referer: http://localhost:3000/dashboard/resumes' \
--header 'Sec-Fetch-Dest: empty' \
--header 'Sec-Fetch-Mode: cors' \
--header 'Sec-Fetch-Site: same-origin' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36' \
--header 'sec-ch-ua: "Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "Windows"' \
--data-raw '{
    "data": {
  "basics": {
    "url": {
      "href": "https://kkammili.com",
      "label": ""
    },
    "name": "Krishnamraju kammili",
    "email": "kkrajus777@gmail.com",
    "phone": "(469) 569-6257",
    "picture": {
      "url": "",
      "size": 64,
      "effects": {
        "border": false,
        "hidden": false,
        "grayscale": false
      },
      "aspectRatio": 1,
      "borderRadius": 0
    },
    "headline": "MERN Developer",
    "location": "1000 cannon pkwy",
    "customFields": []
  },
  "sections": {
    "awards": {
      "id": "awards",
      "name": "Awards",
      "items": [
        {
          "id": "k2fzyioium1mr4nqpje6s0x6",
          "url": {
            "href": "",
            "label": ""
          },
          "date": "2014-11-01",
          "title": "Award",
          "awarder": "Company",
          "summary": "There is no spoon.",
          "visible": true
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "custom": {},
    "skills": {
      "id": "skills",
      "name": "Skills",
      "items": [
        {
          "id": "l43au819oczv5sbq5348rq15",
          "name": "Web Development",
          "level": 1,
          "visible": true,
          "keywords": [
            "HTML",
            "CSS",
            "JavaScript"
          ],
          "description": "Master"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "summary": {
      "id": "summary",
      "name": "Summary",
      "columns": 1,
      "content": "A summary of krishnamraju as a developer…",
      "visible": true,
      "separateLinks": true
    },
    "profiles": {
      "id": "profiles",
      "name": "Profiles",
      "items": [
        {
          "id": "tgrhuf4qai5sw2r06cisyshv",
          "url": {
            "href": "https://twitter.com/john",
            "label": ""
          },
          "icon": "twitter",
          "network": "Twitter",
          "visible": true,
          "username": "john"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "projects": {
      "id": "projects",
      "name": "Projects",
      "items": [],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "education": {
      "id": "education",
      "name": "Education",
      "items": [
        {
          "id": "jntq3yrrboolnnzj8b7lz8es",
          "url": {
            "href": "https://institution.com/",
            "label": ""
          },
          "area": "Software Development",
          "date": "2011-01-01 - 2013-01-01",
          "score": "4.0",
          "summary": "",
          "visible": true,
          "studyType": "Bachelor",
          "institution": "University"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "interests": {
      "id": "interests",
      "name": "Interests",
      "items": [
        {
          "id": "ge5kr8b50ar579kktis3m180",
          "name": "Wildlife",
          "visible": true,
          "keywords": [
            "Ferrets",
            "Unicorns"
          ]
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "languages": {
      "id": "languages",
      "name": "Languages",
      "items": [
        {
          "id": "z0zgs9c1ev80xqt2iww79u0f",
          "name": "English",
          "level": 1,
          "visible": true,
          "description": "Native speaker"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "volunteer": {
      "id": "volunteer",
      "name": "Volunteering",
      "items": [
        {
          "id": "a1rlbng023623xl1tgub7rw5",
          "url": {
            "href": "https://organization.com/",
            "label": ""
          },
          "date": "2012-01-01 - 2013-01-01",
          "summary": "Description…",
          "visible": true,
          "location": "",
          "position": "Volunteer",
          "organization": "Organization"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "experience": {
      "id": "experience",
      "name": "Experience",
      "items": [
        {
          "id": "iincceldkxlnty8xqt4rtbcu",
          "url": {
            "href": "https://company.com",
            "label": ""
          },
          "date": "2013-01-01 - 2014-01-01",
          "company": "Company",
          "summary": "Description…",
          "visible": true,
          "location": "",
          "position": "President"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "references": {
      "id": "references",
      "name": "References",
      "items": [
        {
          "id": "f7trykiqy0yiia2onsfmd2qc",
          "url": {
            "href": "",
            "label": ""
          },
          "name": "Jane Doe",
          "summary": "Reference…",
          "visible": true,
          "description": ""
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "publications": {
      "id": "publications",
      "name": "Publications",
      "items": [
        {
          "id": "z068gq9m38b78wz9l08limxc",
          "url": {
            "href": "https://publication.com",
            "label": ""
          },
          "date": "2014-10-01",
          "name": "Publication",
          "summary": "Description…",
          "visible": true,
          "publisher": "Company"
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    },
    "certifications": {
      "id": "certifications",
      "name": "Certifications",
      "items": [
        {
          "id": "cu7hsyltzh6d2zhuhxhf4pw4",
          "url": {
            "href": "",
            "label": ""
          },
          "date": "2021-11-07",
          "name": "Certificate",
          "issuer": "Company",
          "summary": "",
          "visible": true
        }
      ],
      "columns": 1,
      "visible": true,
      "separateLinks": true
    }
  }
}
}'


create a resume and the use id from response to visit
http://localhost:3000/builder/{id}


check how to visit using reactive-resume-iframe project. just open iframe using above builder url