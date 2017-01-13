import React, { Component, PropTypes } from 'react'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import {observer} from 'mobx-react'

// ------------------------------------
// Presentation components
// ------------------------------------
const propTypes = {
  gavinStore : PropTypes.object
}

@observer
class VariantTable extends Component {
  render () {
      var gavinStore = this.props.gavinStore;
      console.log(gavinStore);
      if (gavinStore.isLoading) {
          return <div>Loading...</div>;
      } else {
          return (
              <BootstrapTable ref='table' data={gavinStore.variants}>
                  <TableHeaderColumn dataField='totalScore'>score</TableHeaderColumn>
                  <TableHeaderColumn dataField='identifier' hidden isKey>identifier</TableHeaderColumn>
                   <TableHeaderColumn dataField='CHROM'>Chromosome</TableHeaderColumn>
                   <TableHeaderColumn dataField='POS'>Position</TableHeaderColumn>
                   <TableHeaderColumn dataField='REF'>Reference allele</TableHeaderColumn>
                   <TableHeaderColumn dataField='ALT'>Alternative allele</TableHeaderColumn>
                   <TableHeaderColumn dataField='Gene'>HGNC Gene</TableHeaderColumn>
                   <TableHeaderColumn width='250' dataField='Gavin'>Gavin</TableHeaderColumn>
               </BootstrapTable>
          )
      }
  }
}

VariantTable.propTypes = propTypes
export default VariantTable