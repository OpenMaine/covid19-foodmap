from selenium import webdriver
from bs4 import BeautifulSoup
import time
import csv

chrome_driver = 'chromedriver'
browser = webdriver.Chrome(executable_path = './webdrivers/chromedriver_83')
url = 'https://www.gsfb.org/covid-19-partner-agency-updates/'
browser.get(url)

table_data = []
try:
    loop_count = 0
    while True and loop_count < 1000:
        # process current page
        page_html = browser.page_source
        soup = BeautifulSoup(page_html, 'html.parser')
        table_rows = soup.find(id='tablepress-11').find('tbody').find_all('tr')
        for row in table_rows:
            row_data = row.find_all('td')
            #print(row.prettify())
            table_data.append([entry.text for entry in row_data])
        
        # go to next page
        next_link = next_link = browser.find_element_by_xpath('//a[@id="tablepress-11_next" and not(contains(@class,"disabled"))]')
        next_link.click()
        time.sleep(0.1)
        loop_count += 1
except: 
    print('Done scraping.')

if len(table_data) > 0:
    print("Writing data.")
    with open('gsfb_scrape.csv', 'w', newline='', encoding="utf8") as csvfile:
        writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        for row in table_data:
            writer.writerow(row)
else:
    print("Unable to find data.")