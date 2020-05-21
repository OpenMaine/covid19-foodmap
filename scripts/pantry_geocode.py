import requests
import csv
import json

geocodingService = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&SingleLine='
singleLineAddress = ''

data_file = 'pantries.csv'

newData = []
with open(data_file, newline='', encoding="utf8") as csvfile:
    csvReader = csv.reader(csvfile)
    count = 0
    for row in csvReader:
        if count == 0:
            row.append('latitude')
            row.append('longitude')
        elif count > 0:
            r = requests.get(geocodingService + row[4])
            candidates = r.json()['candidates']
            if len(candidates) > 0:
                bestMatch = candidates[0]
                row.append(bestMatch['location']['y']) # latitude
                row.append(bestMatch['location']['x'])
                print(f"Finished {bestMatch['address']} {bestMatch['location']['y']} {bestMatch['location']['x']}")
            #input('key to continue')

        newData.append(row)
        count += 1

print("Writing data...")
with open('output.csv', 'w', newline='', encoding="utf8") as csvfile:
    writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
    for row in newData:
        writer.writerow(row)

print("Done.")
